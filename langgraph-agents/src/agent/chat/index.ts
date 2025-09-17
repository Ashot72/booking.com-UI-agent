import {
  Annotation,
  END,
  MessagesAnnotation,
  START,
  StateGraph,
} from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';

const ChatAgentAnnotation = Annotation.Root({
  messages: MessagesAnnotation.spec.messages,
});

const graph = new StateGraph(ChatAgentAnnotation)
  .addNode('chat', async state => {
    const model = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0.8,
      streaming: true,
    });

    const response = await model.invoke([
      {
        role: 'system',
        content: 'You are a helpful assistant.',
      },
      ...state.messages,
    ]);

    return {
      messages: [response],
    };
  })
  .addEdge(START, 'chat')
  .addEdge('chat', END);

export const agent = graph.compile();
agent.name = 'Chat Agent';
