import { useStreamContext } from "@/providers/Stream";
import { Message } from "@langchain/langgraph-sdk";
import { getContentString, getImageURLsFromContent } from "@/utils/util";
import { HumanMessageText } from "./Messages";
import BranchSwitcher from "../BranchSwitcher";

interface HumanMessageProps {
    message: Message,
    isLoading?: boolean
}

const HumanMessage: React.FC<HumanMessageProps> = ({
    message,
    isLoading
}) => {
    const thread = useStreamContext()
    const meta = thread.getMessagesMetadata(message)
    const parentCheckpoint = meta?.firstSeenState?.parent_checkpoint

    const contentString = getContentString(message?.content)
    const contentImages = getImageURLsFromContent(message?.content)

    const createdAt = meta?.firstSeenState?.created_at
    let formatted: string = ""
    if (createdAt) {
        formatted = new Date(createdAt).toLocaleString();
    }

    const handleSubmitEdit = (content?: string) => {
        if (content) {
            const newMessage: Message = { type: "human", content }
            thread.submit(
                { messages: [newMessage] },
                {
                    checkpoint: parentCheckpoint,
                    streamMode: ["values"],
                    optimisticValues: (prev) => {
                        const values = meta?.firstSeenState?.values
                        if (!values) return prev

                        return {
                            ...values,
                            messages: [...(values.messages ?? []), newMessage]
                        }
                    }
                }
            )
        }
    }

    return (
        <> {contentImages.length > 0 &&
            contentImages.map((url: string, index: number) => (
                <img
                    key={index}
                    src={url}
                    alt={`image-${index}`}
                    className="img-fluid pb-2"
                />
            ))
        }
            <HumanMessageText
                content={contentString}
                createdAt={formatted}
                onAction={handleSubmitEdit}
            />
            <div>
                <BranchSwitcher
                    branch={meta?.branch}
                    branchOptions={meta?.branchOptions}
                    onSelect={branch => thread.setBranch(branch)}
                    isLoading={isLoading}
                />
            </div>
        </>
    )
}

export default HumanMessage