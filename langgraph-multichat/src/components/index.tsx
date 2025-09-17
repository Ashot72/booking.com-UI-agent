
import { useEffect } from "react"
import { toast } from "sonner"
import { useStreamContext } from "@/providers/Stream"
import { useScroll } from "@/providers/Scroll"
import HumanMessage from "./messages/HumanMesage"
import { DO_NOT_RENDER_ID_PREFIX } from "@/utils/checkResponses"
import AIMessage from "./messages/AIMessage"
import { isInterrupt } from "@/utils/interrupt"

export function Thread() {
    const { setShouldScroll } = useScroll();

    const thread = useStreamContext()
    const messages = thread.messages
    const isLoading = thread.isLoading

    const threadInterrupt = thread.interrupt

    useEffect(() => {
        setShouldScroll(true)
    }, [])

    useEffect(() => {
        try {
            if (thread.error) {
                const message = (thread.error as any).message
                toast.error("An error occured. Please try again.", {
                    description: (
                        <p>
                            <strong>Error:</strong><code>{message}</code>
                        </p>
                    ),
                    richColors: true,
                    closeButton: true
                })
            }
        } catch {
            // no-op
        }
    }, [thread.error])

    return (
        <div>
            {
                messages && messages
                    .filter((m) => !m.id?.startsWith(DO_NOT_RENDER_ID_PREFIX))
                    .map((message, index) =>
                        message.type === "human" ? (
                            <div key={message.id || `${message.type}-${index}`}>
                                <HumanMessage
                                    message={message}
                                    isLoading={isLoading}
                                />
                                {messages.length === 1 && isInterrupt(threadInterrupt?.value) &&
                                    < AIMessage
                                        message={message}
                                        isLoading={isLoading}
                                    />
                                }
                            </div>
                        ) : (
                            <AIMessage
                                key={message.id || `${message.type}-${index}`}
                                message={message}
                                isLoading={isLoading}
                            />
                        )
                    )
            }
            {
                isLoading && messages?.length > 0 &&
                <div className="d-flex justify-content-end">
                    <div className="spinner-border text-muted" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            }
        </div>
    )
}