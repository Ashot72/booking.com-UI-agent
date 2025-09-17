import { Message } from "@langchain/langgraph-sdk";
import { HumanInterrupt } from "@langchain/langgraph/prebuilt";
import { validate } from "uuid"

type ThreadSearchMetadata =
    | { assistant_id: string }
    | { graph_id: string };

export function getThreadSearchMetadata(assistantId: string): ThreadSearchMetadata {
    return validate(assistantId)
        ? { assistant_id: assistantId }
        : { graph_id: assistantId };
}

export function getContentString(content: Message["content"]): string {
    if (typeof content === "string") return content
    if (!content) return ""
    const texts = content
        .filter((c): c is { type: "text"; text: string } => c.type === "text")
        .map((c) => c.text)
    return texts.join(" ")
}

export function getImageURLsFromContent(content: Message["content"]): string[] {
    if (!Array.isArray(content)) return [];

    return content
        .filter((c): c is { type: "image_url"; image_url: { url: string } } => c.type === "image_url" && !!c.image_url)
        .map((c) => c.image_url.url);
}

export function firstToUpper(label: string): string {
    return label.charAt(0).toUpperCase() + label.slice(1)
}

export function getTrimmedContent(content: string) {
    if (content.length > 100) {
        return content.substring(0, 100) + " ...";
    }
    return content;
}

export function isVerifyNotifInterrupt(value: unknown): value is HumanInterrupt | HumanInterrupt[] {
    const interruptObj = Array.isArray(value) ? value[0] : value
    return interruptObj?.action_request.action === "Verify Notification"
}

export function constructOpenInStudioURL(apiUrl: string, threadId?: string) {
    const smithStudioURL = new URL("https://smith.langchain.com/studio/thread");

    // Ensure apiUrl has no trailing slash
    const trimmedApiUrl = apiUrl.replace(/\/$/, "");

    // Append baseUrl
    smithStudioURL.searchParams.set("baseUrl", trimmedApiUrl);

    // Append threadId if available
    if (threadId) {
        smithStudioURL.searchParams.set("threadId", encodeURIComponent(threadId));
    }

    return smithStudioURL.toString();
}