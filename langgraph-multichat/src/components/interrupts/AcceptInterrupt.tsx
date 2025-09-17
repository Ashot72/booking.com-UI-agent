import { InterruptForm } from "./InterruptForm"

interface AcceptInterruptProps {
    actionRequestArgs: Record<string, any>
    handleSubmit: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => Promise<void>
}

const Accept: React.FC<AcceptInterruptProps> = ({ actionRequestArgs, handleSubmit }) => {

    return (
        <>
            {actionRequestArgs && Object.keys(actionRequestArgs).length > 0} &&
            <InterruptForm args={actionRequestArgs} readOnly />

            <div className="row align-items-start mb-3">
                <div className="col-md-3" />
                <div className="col-md-9">

                    <div className="d-flex justify-content-end mt-2">
                        <button
                            type="button"
                            className="btn btn-primary"
                            style={{ textTransform: "none" }}
                            onClick={handleSubmit}
                        >
                            <i className="fas fa-check me-2"></i> Accept
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Accept