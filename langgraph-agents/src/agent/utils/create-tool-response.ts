import { v4 as uuidv4 } from 'uuid';
import { ToolMessage } from '@langchain/langgraph-sdk';
import { AIMessage } from '@langchain/core/messages';

export const DO_NOT_RENDER_ID_PREFIX = 'escape-rendering';

/**
 * Creates a tool response message for a given tool call
 * @param toolCallId - The ID of the tool call to respond to
 * @param content - The content of the tool response
 * @param name - Optional name of the tool (defaults to empty string)
 * @returns A ToolMessage object
 */
export function createToolResponse(
  toolCallId: string,
  content: string,
  name: string = ''
): ToolMessage {
  return {
    type: 'tool',
    id: `${DO_NOT_RENDER_ID_PREFIX}${uuidv4()}`,
    tool_call_id: toolCallId,
    name,
    content,
  };
}
