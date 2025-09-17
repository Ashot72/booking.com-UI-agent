import { HumanInterrupt } from "@langchain/langgraph/prebuilt";
import { HumanResponseWithEdits } from "@/types";
import Accept from "./AcceptInterrupt";
import { InterruptForm } from "./InterruptForm";

interface EditAndOrAcceptInterruptProps {
    humanResponse: HumanResponseWithEdits[],
    interrupt: HumanInterrupt,
    handleSubmit: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => Promise<void>
    onEditChange?: (key: string | string[], text: string | string[],
        hasChanged: boolean, response: HumanResponseWithEdits) => void
}

const EditAndOrAcceptInterrupt: React.FC<EditAndOrAcceptInterruptProps> = ({
    humanResponse,
    interrupt,
    handleSubmit,
    onEditChange
}) => {
    const editResponse = humanResponse.find(r => r.type === "edit")
    const acceptResponse = humanResponse.find(r => r.type === "accept")

    if (!editResponse || typeof editResponse.args !== "object" || !editResponse.args) {
        if (acceptResponse) {
            return (
                <Accept
                    actionRequestArgs={interrupt.action_request.args}
                    handleSubmit={handleSubmit}
                />
            )
        }
        return null
    }

    const header = editResponse.acceptAllowed ? "Edit/Accept" : "Edit"
    let buttonText = "Submit"
    if (editResponse.acceptAllowed && !editResponse.editsMade) {
        buttonText = "Accept"
    }

    const onEdit = (key: string | string[], text: string | string[], hasChanged: boolean) => {
        if (onEditChange) {
            onEditChange(key, text, hasChanged, editResponse)
        }
    }

    return (
        <>
            <div className="container mt-3">
                <div className="row align-items-center justify-content-between">
                    <div className="col-auto">
                        <h3 className="f-4"
                            style={{ color: "rgb(79, 79, 79)" }}
                        >{header}</h3>
                    </div>
                </div>
            </div>
            {
                <InterruptForm
                    args={interrupt.action_request.args}
                    readOnly={false}
                    onEditChange={onEdit}
                />
            }
            <div
                className="text-end d-flex justify-content-end gap-3">
                <button
                    style={{ textTransform: "none" }}
                    type="submit" className="btn btn-primary"
                    onClick={handleSubmit}
                >
                    <i className="fas fa-check me-2"></i>
                    {buttonText}
                </button>
            </div>
        </>
    );
}

export default EditAndOrAcceptInterrupt