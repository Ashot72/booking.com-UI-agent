import { HumanResponse } from "@langchain/langgraph/prebuilt"

export type HumanResponseWithEdits = HumanResponse & (
    | { acceptAllowed?: false, editsMade?: never }
    | { acceptAllowed?: true, editsMade?: boolean }
)

export type SubmitType = "accept" | "response" | "edit"

export type MessageContent =
    | string
    | Array<{
        type: "image_url";
        image_url: { url: string };
    } | {
        type: "text";
        text: string;
    }>;