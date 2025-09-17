
import { v4 as uuidv4 } from "uuid"
import { useRef, useEffect } from "react";
import { useQueryState } from 'nuqs';
import { useStreamContext } from "@/providers/Stream";
import { Message } from "@langchain/langgraph-sdk";
import { ensureToolCallHaveResponses } from "@/utils/checkResponses";
import { MessageContent } from "@/types";

export default function PromptInput() {
    const imageDataURLRef = useRef<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [apiUrl] = useQueryState("apiUrl")
    const [assistantId] = useQueryState("assistantId")

    const enabled = apiUrl && assistantId

    useEffect(() => inputRef.current?.focus(), []);

    const thread = useStreamContext()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const prompt = inputRef.current?.value || '';
        if (!prompt) return;

        const base64Image = imageDataURLRef.current;
        const content: MessageContent = base64Image
            ? [
                { type: "image_url", image_url: { url: base64Image } },
                { type: "text", text: prompt }
            ] :
            prompt

        const messages = thread.messages
        const newHumanMessage: Message = {
            id: uuidv4(),
            type: "human",
            content
        }

        const toolMessages = ensureToolCallHaveResponses(messages)

        thread.submit(
            { messages: [...toolMessages, newHumanMessage] },
            {
                streamMode: ["values"],
                optimisticValues: (prev) => ({
                    ...prev,
                    messages: [
                        ...(prev.messages ?? []),
                        ...toolMessages,
                        newHumanMessage
                    ]
                })
            }
        )

        inputRef.current!.value = ""
        imageDataURLRef.current = null
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            imageDataURLRef.current = reader.result as string;
        };
        reader.readAsDataURL(file);
    };

    return (
        <form
            ref={formRef}
            onSubmit={handleSubmit}>
            <div className="card-footer text-muted d-flex justify-content-start align-items-center p-3">
                <img
                    src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp"
                    alt="avatar 3"
                    style={{ width: "40px", height: "100%" }}
                />
                <input
                    ref={inputRef}
                    id="prompt"
                    name="prompt"
                    type="text"
                    className="form-control form-control-lg border-0"
                    placeholder="Type message"
                    disabled={!enabled}
                />
                {assistantId === "chat_agent" &&
                    <>
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="d-none"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        <a
                            className={`ms-1 text-muted ${!enabled ? 'text-secondary' : ''}`}
                            style={{
                                cursor: enabled ? 'pointer' : 'not-allowed',
                                pointerEvents: enabled ? 'auto' : 'none',
                            }}
                            onClick={enabled ? () => fileInputRef.current?.click() : undefined}
                        >
                            <i className="fas fa-paperclip" title="File Upload"></i>
                        </a>
                    </>
                }
                <a
                    className={`ms-3 ${!enabled ? 'text-muted' : ''}`}
                    style={{
                        cursor: enabled ? 'pointer' : 'not-allowed',
                        pointerEvents: enabled ? 'auto' : 'none',
                    }}
                    onClick={enabled ? () => formRef.current?.requestSubmit() : undefined}
                >
                    {thread.isLoading ? (
                        <i
                            className="fas fa-stop-circle text-danger"
                            title="Stop"
                            style={{ cursor: "pointer" }}
                            onClick={() => thread.stop()}
                        />
                    ) : (
                        <i
                            className="fas fa-paper-plane"
                            title="Send"
                        />
                    )}
                </a>
            </div>
        </form>
    )
}