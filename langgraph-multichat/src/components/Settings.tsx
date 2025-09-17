import { useRef } from 'react';
import { useQueryState } from 'nuqs';
import { toast } from "sonner";

export default function Settings() {
    const deploymentUrlRef = useRef<HTMLInputElement>(null);
    const graphIdRef = useRef<HTMLInputElement>(null);

    const [, setApiUrl] = useQueryState("apiUrl")
    const [, setAssistantId] = useQueryState("assistantId")

    async function checkGraphStatus(apiUrl: string): Promise<boolean> {
        try {
            const res = await fetch(`${apiUrl}/info`)
            return res.ok
        } catch (e) {
            console.error(e)
            return false
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const apiUrl = deploymentUrlRef.current?.value || '';
        const assistantId = graphIdRef.current?.value || '';

        if (apiUrl && assistantId) {
            checkGraphStatus(apiUrl).then(ok => {
                if (!ok) {
                    toast.error("Failed to connect to LangGraph server", {
                        description: () => (
                            <p>
                                Please ensure your graph is running at <code>{apiUrl}</code> and
                                your API key is correctly set (if connecting to a deployed graph).
                            </p>
                        ),
                        duration: 10000,
                        richColors: true,
                        closeButton: true
                    })
                } else {
                    setApiUrl(apiUrl)
                    setAssistantId(assistantId)
                }
            })
        }
    };

    return (
        <div className="container py-5">
            <div className="card">
                <div className="card-header align-items-center p-3">
                    <h5>Multi Agent Chat</h5>
                    <div>
                        Welcome to Multi Agent Chat! Before you get started, you need to enter the URL of the deployment and the assistant / graph ID.
                    </div>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="deploymentUrl" className="form-label">
                                Deployment URL <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                id="deploymentUrl"
                                name="deploymentUrl"
                                className="form-control"
                                ref={deploymentUrlRef}
                                defaultValue="http://localhost:2024"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="graphId" className="form-label">
                                Assistant / Graph ID <span className="text-danger">*</span>
                            </label>

                            <input
                                className="form-control"
                                list="graphOptions"
                                id="graphId"
                                name="graphId"
                                placeholder="Type or select an agent"
                                required
                                defaultValue="agent"
                                ref={graphIdRef}
                            />

                            <datalist id="graphOptions">
                                <option value="chat_agent" />
                                <option value="search_agent" />
                                <option value="job-notification_agent" />
                                <option value="booking_agent" />
                                <option value="supervisor_agent" />
                            </datalist>
                        </div>
                        <div className="text-end">
                            <button
                                style={{ textTransform: "none" }}
                                type="submit"
                                className="btn btn-primary">
                                Continue <i className="fas fa-arrow-right ms-2"></i>
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    );
}
