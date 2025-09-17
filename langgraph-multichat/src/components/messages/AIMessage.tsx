import { useStreamContext } from "@/providers/Stream";
import { Message } from "@langchain/langgraph-sdk";
import { getContentString, isVerifyNotifInterrupt } from "@/utils/util";
import { isInterrupt } from "@/utils/interrupt";
import { AIMessageComponent, AIMessageText } from "./Messages";
import BranchSwitcher from "../BranchSwitcher";
import InterruptView from "../interrupts/InterruptView";
import ExternalComponent from "./ExternalComponent";

interface AIMessageProps {
    message: Message,
    isLoading?: boolean
}

const AIMessage: React.FC<AIMessageProps> = ({
    message,
    isLoading
}) => {
    const thread = useStreamContext()
    const meta = message ? thread.getMessagesMetadata(message) : undefined
    const parentCheckpoint = meta?.firstSeenState?.parent_checkpoint

    const threadInterrupt = thread.interrupt
    const verifyNotifInterrupt = isVerifyNotifInterrupt(threadInterrupt?.value)

    const content = message?.content ?? []
    const contentString = getContentString(content)

    const createdAt = meta?.firstSeenState?.created_at
    let formatted: string = ""
    if (createdAt) {
        formatted = new Date(createdAt).toLocaleString();
    }

    const handleSubmitRefresh = () => {
        thread.submit(undefined, {
            checkpoint: parentCheckpoint,
            streamMode: ["values"]
        })
    }

    return (
        <>
            {
                isInterrupt(threadInterrupt?.value) ? (
                    <>
                        <AIMessageComponent
                            createdAt={formatted}
                            onAction={handleSubmitRefresh}
                            isLoading={isLoading || verifyNotifInterrupt}
                        >
                            <InterruptView
                                interrupt={threadInterrupt.value} />
                        </AIMessageComponent>
                        {!isLoading &&
                            <div>
                                <BranchSwitcher
                                    branch={meta?.branch}
                                    branchOptions={meta?.branchOptions}
                                    onSelect={branch => thread.setBranch(branch)}
                                />
                            </div>
                        }
                    </>
                ) : (
                    <>
                        {contentString ?
                            <>
                                <AIMessageText
                                    content={contentString}
                                    createdAt={formatted}
                                    isLoading={isLoading}
                                    onAction={handleSubmitRefresh}
                                />                              
                            </>
                            : null}
                           {message && 
                           <ExternalComponent
                              message={message} 
                              thread={thread}
                          />}
                           {
                             contentString && !isLoading &&
                             <div>
                                <BranchSwitcher
                                    branch={meta?.branch}
                                    branchOptions={meta?.branchOptions}
                                    onSelect={branch => thread.setBranch(branch)}
                                />
                             </div>
                            }
                    </>
                )
            }
        </>
    )
}

export default AIMessage