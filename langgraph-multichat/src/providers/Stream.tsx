import { useQueryState } from "nuqs";
import { useStream } from "@langchain/langgraph-sdk/react";
import { type Message } from "@langchain/langgraph-sdk";
import { createContext, ReactNode, useContext, useMemo } from "react";
import { RemoveUIMessage, UIMessage, uiMessageReducer } from "@langchain/langgraph-sdk/react-ui";
import { useThreads } from "@/hooks/useThreads";

export type StateType = { messages: Message[]; ui?: UIMessage[] };

const useTypedStream = useStream<
    StateType,
    {
        UpdateType: {
            messages?: Message[] | Message | string;
            ui?: (UIMessage | RemoveUIMessage)[] | UIMessage | RemoveUIMessage;
        };
        CustomEventType: UIMessage | RemoveUIMessage;
    }
>;

type StreamContextType = ReturnType<typeof useTypedStream>
const StreamContext = createContext<StreamContextType | undefined>(undefined)

async function sleep(ms = 4000) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

const StreamSession = ({
    children,
    apiUrl,
    assistantId
}: {
    children: ReactNode,
    apiUrl?: string | null,
    assistantId: string | null
}) => {
    const { getThreads, setThreads } = useThreads()
    const [threadId, setThreadId] = useQueryState("threadId")

    function isBestEmployeeToolCall(message: any): boolean {
        return (
            "tool_call_chunks" in message &&
            Array.isArray(message.tool_call_chunks) &&
            message.tool_call_chunks.some((chunk: any) => chunk.name === "best_employee")
        );
    }

    function filterMessagesKeepLastBestEmployee(messages: any[]) {
        const bestEmployeeMessages = messages.filter(isBestEmployeeToolCall);
        const lastBestEmployeeMessage = bestEmployeeMessages.at(-1);

        return messages.filter((m) => {
            if (isBestEmployeeToolCall(m)) {
                return m === lastBestEmployeeMessage;
            }
            return true;
        });
    }

    const streamValue = useTypedStream({
        apiUrl: apiUrl ?? undefined,
        apiKey: undefined, //dev mode
        assistantId: assistantId ?? "",
        threadId: threadId ?? null,
        onCustomEvent: (event, options) => {
            options.mutate((prev) => {
                const ui = uiMessageReducer(prev.ui ?? [], event)
                return { ...prev, ui };
            });
        },
        onThreadId: (id) => {
            setThreadId(id)
            sleep().then(() => getThreads().then(setThreads).catch(console.error))
        }
    })

    const filteredStreamValue = useMemo(() => ({
        ...streamValue,
        messages: filterMessagesKeepLastBestEmployee(streamValue.messages ?? []),
    }), [streamValue]);

    return (
        <StreamContext.Provider value={filteredStreamValue}>
            {children}
        </StreamContext.Provider>
    )
}

export const StreamProvider: React.FC<{ children: ReactNode }> = ({
    children
}) => {
    const [apiUrl] = useQueryState("apiUrl")
    const [assistantId] = useQueryState("assistantId")

    if (!apiUrl && !assistantId) return null

    return (
        <StreamSession apiUrl={apiUrl} assistantId={assistantId}>
            {children}
        </StreamSession>
    )
}

export const useStreamContext = (): StreamContextType => {
    const context = useContext(StreamContext)
    if (context === undefined) {
        throw new Error("useStreamContext muse be within a StreamProvider")
    }
    return context
}

export default StreamContext