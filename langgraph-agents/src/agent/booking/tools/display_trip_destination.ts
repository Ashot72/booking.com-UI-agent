import { ChatOpenAI } from '@langchain/openai';
import { AIMessage } from '@langchain/core/messages';
import { typedUi } from '@langchain/langgraph-sdk/react-ui/server';
import { LangGraphRunnableConfig } from '@langchain/langgraph';
import type ComponentMap from '../../../agent-uis/index';
import { BookingState, BookingUpdate } from '../types';

export async function displayTripDestination(
  state: BookingState,
  config: LangGraphRunnableConfig
): Promise<BookingUpdate> {
  // Check if trips exist in state
  if (!state.trips || state.trips.length === 0) {
    return {
      messages: [new AIMessage('No trips found. Please create a trip first.')],
    };
  }

  // Get the active trip or first trip
  const activeTrip = state.trips[state.activeTripIndex || 0];

  if (!activeTrip?.destination?.data?.[0]) {
    return {
      messages: [new AIMessage('No destination found in the selected trip.')],
    };
  }

  try {
    const ui = typedUi<typeof ComponentMap>(config);

    // Create model with tool binding
    const model = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0,
    });

    // Invoke LLM with tool binding
    const response = await model.invoke([
      {
        role: 'system',
        content:
          'You are a helpful travel assistant. Show the destination information. Include interesting facts or highlights.',
      },
      ...state.messages,
    ]);

    const destination = activeTrip.destination;

    ui.push(
      {
        name: 'trip-destination',
        props: {
          destination,
        },
      },
      { message: response }
    );

    return {
      messages: [response],
      ui: ui.items,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Error pushing trip destinations:', error);
    return {
      messages: [
        new AIMessage(
          'Sorry, I encountered an error while processing the destination. Please try again.'
        ),
      ],
    };
  }
}
