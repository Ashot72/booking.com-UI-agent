import { HumanInterrupt } from "@langchain/langgraph/prebuilt";
import { InterruptForm } from "./InterruptForm";
import { HumanResponseWithEdits } from "@/types";
import ResponseToggle from "../ResponseToggle";

interface ResponseInterruptProps {
    interrupt: HumanInterrupt
    showArgsInResponse: boolean
    humanResponse: HumanResponseWithEdits[],
    onResponseChange: (change: boolean, response: HumanResponseWithEdits) => void
    handleSubmit: (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => Promise<void>;
}

const ResponseInterrupt: React.FC<ResponseInterruptProps> = ({
    interrupt,
    showArgsInResponse,
    humanResponse,
    onResponseChange,
    handleSubmit
}) => {
    const res = humanResponse.find(r => r.type === "response")
    if (!res || typeof res.args !== "string") {
        return null
    }

    const onSendResponse = (checked: boolean) => {
        const res = humanResponse.find(r => r.type === "response")
        if (!res || typeof res.args !== "string") {
            return null
        }

        onResponseChange(checked, res)
    };

    return (
        <>
            {showArgsInResponse &&
                <InterruptForm
                    args={interrupt.action_request.args}
                    readOnly={false}
                />
            }

            <ResponseToggle
                label={interrupt.description || 'Unknown'}
                onSendResponse={onSendResponse}
                handleSubmit={handleSubmit}
            />
        </>
    )
}

export default ResponseInterrupt