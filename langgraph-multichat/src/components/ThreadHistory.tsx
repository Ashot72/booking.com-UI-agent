
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { useThreads } from "@/hooks/useThreads";
import { getContentString, getTrimmedContent } from "@/utils/util";

export default function ThreadList() {
    const { getThreads, threads, setThreads, threadLoading, setThreadsLoading } = useThreads()

    const [threadId, setThreadId] = useQueryState("threadId")

    useEffect(() => {
        setThreadsLoading(true)
        getThreads().
            then(setThreads).
            catch(console.error)
            .finally(() => setThreadsLoading(false))
    }, [])

    const [open, setOpen] = useState(false);
    const toggleDropdown = () => setOpen(!open);

    const handleSelect = (selThreadId: string) => {
        if (selThreadId === threadId) return
        setThreadId(selThreadId)
        setOpen(false);
    };

    if (threadLoading) {
        return (
            <div className="d-flex justify-content-center">
                <div className="spinner-border text-muted" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="dropdown d-flex align-items-center gap-2">
            <button
                style={{ textTransform: "none" }}
                className="btn btn-primary"
                onClick={() => setThreadId(null)}
                title="New Thread"
            >
                <i className="fas fa-plus text-white"></i> New
            </button>
            <div
                style={{ textTransform: "none", cursor: "pointer" }}
                className="btn btn-primary dropdown-toggle"
                onClick={toggleDropdown}
            >
                <i
                    className="fas fa-bars me-2"></i> Threads
            </div>

            {open && (
                <div className="dropdown-menu show"
                    style={{
                        maxHeight: "700px",
                        maxWidth: "800px",
                        overflowY: "auto",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                    }}
                >
                    {threads.map((t, index) => {
                        let itemText = t.thread_id
                        if (
                            typeof t.values === "object" &&
                            t.values &&
                            "messages" in t.values &&
                            Array.isArray(t.values.messages) &&
                            t.values.messages?.length > 0
                        ) {
                            const firstMessage = t.values.messages[0]
                            itemText = getTrimmedContent(getContentString(firstMessage.content))
                        }
                        return (
                            <div key={index} className="dropdown-item" onClick={() => handleSelect(t.thread_id)}>
                                <i className="fas fa-comment"></i> {itemText}
                            </div>
                        )
                    })
                    }
                </div>
            )}
        </div>
    );
}
