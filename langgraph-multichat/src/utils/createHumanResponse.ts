import { HumanInterrupt } from "@langchain/langgraph/prebuilt";
import { HumanResponseWithEdits, SubmitType } from "@/types";

export function createDefaultHumanResponse(
    interrupt: HumanInterrupt,
    initialHumanInterruptEditValue: React.RefObject<Record<string, string>>
): {
    responses: HumanResponseWithEdits[],
    defaultSubmitType: SubmitType | undefined
    hasAccept: boolean
} {
    const responses: HumanResponseWithEdits[] = []
    if (interrupt.config.allow_edit) {
        if (interrupt.config.allow_accept) {
            Object.entries(interrupt.action_request.args).forEach(([k, v]) => {
                let stringValue = ""
                if (typeof v === "string") {
                    stringValue = v
                } else {
                    stringValue = JSON.stringify(v, null)
                }

                if (!initialHumanInterruptEditValue.current ||
                    !(k in initialHumanInterruptEditValue)
                ) {
                    initialHumanInterruptEditValue.current = {
                        ...initialHumanInterruptEditValue.current,
                        [k]: stringValue
                    }
                } else if (
                    k in initialHumanInterruptEditValue.current &&
                    initialHumanInterruptEditValue.current[k] !== stringValue
                ) {
                    console.error(
                        "KEY AND VALYE FOUND IN initialHumanInterruptEditValue.current THAT DOES NOT MATCH THR ACTION REQUEST",
                        {
                            key: k,
                            value: stringValue,
                            expectedValue: initialHumanInterruptEditValue.current[k]
                        }
                    )
                }
            })
            responses.push({
                type: "edit",
                args: interrupt.action_request,
                acceptAllowed: true,
                editsMade: false
            })
        } else {
            responses.push({
                type: "edit",
                args: interrupt.action_request,
                acceptAllowed: false
            })
        }
    }
    if (interrupt.config.allow_respond) {
        responses.push({
            type: "response",
            args: ""
        })
    }

    if (interrupt.config.allow_ignore) {
        responses.push({
            type: "ignore",
            args: null
        })
    }

    // Set the submit type
    // Priority: accept > response > edit
    const acceptAllowedConfig = interrupt.config.allow_accept
    const ignoreAllowedConfig = interrupt.config.allow_ignore

    const hasResponse = responses.find(r => r.type === "response")
    const hasAccept = responses.find(r => r.acceptAllowed) || acceptAllowedConfig
    const hasEdit = responses.find(r => r.type === "edit")

    let defaultSubmitType: SubmitType | undefined
    if (hasAccept) {
        defaultSubmitType = "accept"
    } else if (hasResponse) {
        defaultSubmitType = "response"
    } else if (hasEdit) {
        defaultSubmitType = "edit"
    }

    if (acceptAllowedConfig && !responses.find(r => r.type === "accept")) {
        responses.push({
            type: "accept",
            args: null
        })
    }

    if (ignoreAllowedConfig && !responses.find(r => r.type === "ignore")) {
        responses.push({
            type: "ignore",
            args: null
        })
    }

    return {
        responses,
        defaultSubmitType,
        hasAccept: !!hasAccept
    }
}