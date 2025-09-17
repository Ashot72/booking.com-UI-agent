import { Message } from "@langchain/langgraph-sdk";
import { useStreamContext } from "@/providers/Stream";
import { Fragment } from "react/jsx-runtime";
import { LoadExternalComponent } from "@langchain/langgraph-sdk/react-ui";
import { useArtifact } from "../artifact";

interface ExternalComponentProps {
    message: Message;
    thread: ReturnType<typeof useStreamContext>;
}

const ExternalComponent: React.FC<ExternalComponentProps> = ({
    message,
    thread
}) => {
    const artifact = useArtifact()
    const { values } = useStreamContext()
    const customComponents = values.ui?.filter(ui => ui.metadata?.message_id === message.id)

    if (!customComponents || customComponents.length === 0) return null
    return (
        <Fragment key={message.id}>
            {customComponents.map((customComponent, index) => (
               <LoadExternalComponent
               key={customComponent.id}
                stream={thread}
                message={customComponent}
                meta={{ ui: customComponent, artifact }}
                namespace="agent_uis"
               />
            ))}
        </Fragment>
    )
}

export default ExternalComponent