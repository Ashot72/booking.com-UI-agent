
import { toast } from "sonner";
import { END } from "@langchain/langgraph/web"
import { useEffect, useRef, useState } from "react"
import { ActionRequest, HumanInterrupt, HumanResponse } from "@langchain/langgraph/prebuilt";
import { HumanResponseWithEdits, SubmitType } from "@/types";
import { createDefaultHumanResponse } from "@/utils/createHumanResponse"
import { useStreamContext } from "@/providers/Stream";
import EditAndOrAcceptInterrupt from "./EditAndOrAcceptInterrupt";
import { InterruptForm } from "./InterruptForm";
import ResponseInterrupt from "./ResponseInterrupt";

interface InterruptViewProps {
    interrupt: HumanInterrupt | HumanInterrupt[];
}

const InterruptView: React.FC<InterruptViewProps> = ({
    interrupt
}) => {
    const thread = useStreamContext()
    const interruptObj = Array.isArray(interrupt) ? interrupt[0] : interrupt

    const [hasEdited, setHasEdited] = useState(false)
    const [humanResponse, setHumanResponse] = useState<HumanResponseWithEdits[]>([])
    const initialHumanInterruptEditValue = useRef<Record<string, string>>({})
    const [selectedSubmitType, setSelectedSubmitType] = useState<SubmitType>()
    const [acceptAllowed, setAcceptAllowed] = useState(false)
    const [hasAddedResponse, setHasAddedResponse] = useState(false)

    const isEditAllowed = interruptObj.config.allow_edit
    const isResponseAllowed = interruptObj.config.allow_respond
    const ignoreAllowed = interruptObj.config.allow_ignore

    const hasArgs = Object.entries(interruptObj.action_request.args).length > 0
    const showArgsInResponse = hasArgs && !isEditAllowed && !acceptAllowed && isResponseAllowed
    const showArgsOutsideActonCards = hasArgs && !showArgsInResponse && !isEditAllowed && !acceptAllowed

    const hasResponse = humanResponse.some(r => r.type === "response");
    const hasEditOrAccept = humanResponse.some(r => r.type === "edit" || r.type === "accept");
    const supportsMultipleMethods = hasResponse && hasEditOrAccept;

    useEffect(() => {
        try {
            const { responses, defaultSubmitType, hasAccept } =
                createDefaultHumanResponse(interruptObj, initialHumanInterruptEditValue)
            setSelectedSubmitType(defaultSubmitType)
            setHumanResponse(responses)
            setAcceptAllowed(hasAccept)
        } catch (e) {
            console.error("Error formatting and setting human response state", e)
        }
    }, [interrupt])

    const resumeRun = (response: HumanResponse[]): boolean => {
        try {
            thread.submit(
                {},
                {
                    command: {
                        resume: response
                    }
                }
            )
            return true
        } catch (e: any) {
            console.error("Error sending human response")
            return false
        }
    }

    const handleResolve = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        initialHumanInterruptEditValue.current = {}

        try {
            thread.submit(
                {},
                {
                    command: {
                        goto: END
                    }
                }
            )

            toast("Success", {
                description: "Marked thread as resolved.",
                duration: 3000
            })
        } catch (e) {
            console.error("Error marking thread as resolved", e)
            toast.error("Error", {
                description: "Failed to mark thread as resolved",
                richColors: true,
                closeButton: true,
                duration: 5000
            })
        }
    }

    const handleIgnore = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        initialHumanInterruptEditValue.current = {}

        const ignoreResponse = humanResponse.find(r => r.type === "ignore")
        if (!ignoreResponse) {
            toast.error("Error", {
                description: "The selected thread does not support ignoring",
                richColors: true,
                closeButton: true,
                duration: 5000
            })
            return
        }

        resumeRun([ignoreResponse])

        toast("Successfully ignored thread", {
            duration: 5000
        })
    }

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        initialHumanInterruptEditValue.current = {}

        if (!humanResponse) {
            toast.error("Error", {
                description: "Please enter a response.",
                duration: 5000,
                richColors: true,
                closeButton: true
            })
            return
        }

        if (humanResponse.some(r => ["response", "edit", "accept"].includes(r.type))) {
            try {
                const humanResponseInput: HumanResponse[] = humanResponse.flatMap(
                    r => {
                        if (r.type === "edit") {
                            if (r.acceptAllowed && !r.editsMade) {
                                return {
                                    type: "accept",
                                    args: r.args
                                }
                            } else {
                                return {
                                    type: "edit",
                                    args: r.args
                                }
                            }
                        }

                        if (r.type === "response" && !r.args) {
                            // If response was allowed but no response was given, do not include in the response
                            return []
                        }
                        return {
                            type: r.type,
                            args: r.args
                        }
                    }
                )

                const input = humanResponseInput.find(
                    r => r.type === selectedSubmitType
                )
                if (!input) {
                    toast.error("Error", {
                        description: "No response was found. Please make a change",
                        richColors: true,
                        closeButton: true,
                        duration: 5000
                    })
                    return
                }

                const resumedSuccessfully = resumeRun([input])
                if (!resumedSuccessfully) {
                    // This will only be undefined if the graph ID is not found
                    // in this case, the method will trigger a toast for us.
                    return
                }

                toast("Success", {
                    description: "Response submitted successfully",
                    duration: 5000
                })
            } catch (a: any) {
                console.error("Error sending human response", e)

                if (
                    typeof e === "object" &&
                    e !== null &&
                    "message" in e &&
                    typeof e.message === "string" &&
                    e.message.includes("Invalid assistant ID")
                ) {
                    toast("Error: Invalid assistan ID", {
                        description: "The provided ID was not found in this graph. Please update tje asistan ID in the settings and try again.",
                        richColors: true,
                        closeButton: true,
                        duration: 5000
                    })
                } else {
                    toast.error("Error", {
                        description: "Failed to submit response",
                        richColors: true,
                        closeButton: true,
                        duration: 5000
                    })
                }
            }
        } else {
            resumeRun(humanResponse)

            toast("Success", {
                description: "Response submitted successfully.",
                duration: 5000
            })
        }
    }

    const onEditChange = (key: string | string[], text: string | string[], hasChanged: boolean, response: HumanResponseWithEdits) => {
        if (Array.isArray(text) && !Array.isArray(key) ||
            (!Array.isArray(text) && Array.isArray(key))
        ) {
            toast.error("Error", {
                description: "Something went wrong",
                richColors: true,
                closeButton: true
            })
            return
        }

        if (!hasChanged) {
            setHasEdited(false)
            if (acceptAllowed) {
                setSelectedSubmitType("accept")
            } else if (hasAddedResponse) {
                setSelectedSubmitType("response")
            }
        } else {
            setSelectedSubmitType("edit")
            setHasEdited(true)
        }

        setHumanResponse((prev) => {
            if (typeof response.args !== "object" || !response.args) {
                console.error(
                    "Mismatch response type",
                    !!response.args,
                    typeof response.args
                )
                return prev
            }

            const newEdit: HumanResponseWithEdits = {
                type: response.type,
                args: {
                    action: response.args.action,
                    args: Array.isArray(text) && Array.isArray(key)
                        ? {
                            ...response.args.args,
                            ...Object.fromEntries(key.map((k, i) => [k, text[i]]))
                        } : {
                            ...response.args.args,
                            [key as string]: text as string
                        }
                }
            }
            if (
                prev.find(
                    p => p.type === response.type &&
                        typeof p.args === "object" &&
                        p.args?.action === (response.args as ActionRequest).action
                )
            ) {
                return prev.map(p => {
                    if (
                        p.type === response.type &&
                        typeof p.args === "object" &&
                        p.args?.action === (response.args as ActionRequest).action
                    ) {
                        if (p.acceptAllowed) {
                            return {
                                ...newEdit,
                                acceptAllowed: true,
                                editsMade: hasChanged
                            }
                        }
                        return newEdit
                    }
                    return p
                })
            } else {
                throw new Error("No matching response found")
            }
        })
    }

    const onResponseChange = (change: boolean, response: HumanResponseWithEdits) => {
        if (!change) {
            setHasAddedResponse(false);
            if (hasEdited) {
                // `edit` if they've edited, or `accept` if it's allowed and they have not edited.
                setSelectedSubmitType("edit")
            } else if (acceptAllowed) {
                setSelectedSubmitType("accept")
            }
        } else {
            setSelectedSubmitType("response")
            setHasAddedResponse(true)
        }

        setHumanResponse((prev) => {
            const newResponse: HumanResponseWithEdits = {
                type: response.type,
                args: change.toString()
            }

            if (prev.find((p) => p.type === response.type)) {
                return prev.map((p) => {
                    if (p.type === response.type) {
                        if (p.acceptAllowed) {
                            return {
                                ...newResponse,
                                acceptAllowed: true,
                                editsMade: !!change
                            }
                        }
                        return newResponse
                    }
                    return p
                })
            } else {
                throw new Error("No human response found for string response")
            }
        })
    }

    return (
        <>
            <div className="row align-items-start mb-3">
                <div className="col-md-3" />
                <div className="col-md-9">
                    <div className="d-flex justify-content-end mt-2">
                        <button
                            type="button"
                            className="btn btn-primary"
                            style={{ textTransform: "none" }}
                            onClick={handleResolve}
                        >
                            <i className="fas fa-check-circle me-2"></i> Mark as Resolved
                        </button>

                        {ignoreAllowed && (
                            <button
                                type="button"
                                className="btn btn-primary ms-2"
                                style={{ textTransform: "none" }}
                                onClick={handleIgnore}
                            >
                                <i className="fas fa-ban me-2"></i> Ignore
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {showArgsOutsideActonCards &&
                <InterruptForm args={interruptObj.action_request.args} readOnly />
            }

            <EditAndOrAcceptInterrupt
                interrupt={interruptObj}
                humanResponse={humanResponse}
                handleSubmit={handleSubmit}
                onEditChange={onEditChange}
            />
            {supportsMultipleMethods &&
                <div className="d-flex align-items-center justify-content-center mt-3 w-100">
                    <div
                        className="me-3"
                        style={{ width: '2cm', height: '1px', backgroundColor: '#dee2e6' }}
                    ></div>

                    <span className="text-muted small" style={{ lineHeight: '1' }}>Or</span>

                    <div
                        className="ms-3"
                        style={{ width: '2cm', height: '1px', backgroundColor: '#dee2e6' }}
                    ></div>
                </div>
            }
            <ResponseInterrupt
                interrupt={interruptObj}
                showArgsInResponse={showArgsInResponse}
                humanResponse={humanResponse}
                onResponseChange={onResponseChange}
                handleSubmit={handleSubmit}
            />

        </>
    )
}

export default InterruptView