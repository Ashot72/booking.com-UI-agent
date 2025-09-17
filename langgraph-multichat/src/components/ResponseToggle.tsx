import { useState } from "react";

interface ResponseToggleProps {
    label: string;
    onSendResponse: (checked: boolean) => void;
    handleSubmit: (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    ) => Promise<void>;
}

const ResponseToggle: React.FC<ResponseToggleProps> = ({ label, onSendResponse, handleSubmit }) => {
    const [checked, setChecked] = useState(false);

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(e.target.checked);
        onSendResponse(e.target.checked)
    };

    return (
        <div className="row align-items-start mb-3 mt-3">
            <div className="col-md-3" />
            <div className="col-md-9">
                <div className="d-flex align-items-center">
                    <div className="form-check form-switch m-0">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            checked={checked}
                            onChange={handleCheckboxChange}
                            id="response-toggle"
                        />
                    </div>
                    <label
                        htmlFor="response-toggle"
                        className="mb-0 ms-2"
                        style={{
                            userSelect: "none",
                            color: "rgb(79, 79, 79)",
                        }}
                    >
                        {label}
                    </label>
                </div>

                <div className="d-flex justify-content-end mt-2">
                    <button
                        type="button"
                        className="btn btn-primary"
                        style={{ textTransform: "none" }}
                        onClick={handleSubmit}
                        disabled={!checked}
                    >
                        <i className="fas fa-paper-plane me-2"></i> Send Response
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResponseToggle;