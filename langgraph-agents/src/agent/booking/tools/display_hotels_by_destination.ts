import { BookingState, BookingUpdate } from '../types';
import { ChatOpenAI } from '@langchain/openai';
import { AIMessage } from '@langchain/core/messages';
import { typedUi } from '@langchain/langgraph-sdk/react-ui/server';
import { LangGraphRunnableConfig } from '@langchain/langgraph';
import type ComponentMap from '../../../agent-uis/index';

export async function displayHotelsByDestination(
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

  if (!activeTrip?.hotels || activeTrip.hotels.length === 0) {
    return {
      messages: [
        new AIMessage(
          'No hotels found in the selected trip. Please search for hotels first.'
        ),
      ],
    };
  }

  try {
    const ui = typedUi<typeof ComponentMap>(config);

    // Create model for generating response
    const model = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0,
    });

    // Get all hotels from the active trip
    const hotels = activeTrip.hotels.flatMap(
      hotelData => hotelData.data.hotels
    );

    // Invoke LLM to generate a response about the hotels
    const response = await model.invoke([
      {
        role: 'system',
        content:
          'You are a helpful travel assistant. Provide a brief summary of the available hotels and their key features.',
      },
      ...state.messages,
    ]);

    // Push hotels UI component
    ui.push(
      {
        name: 'hotels-by-destination',
        props: {
          hotels,
          tripId: activeTrip.tripId,
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
    console.error('Error displaying hotels:', error);
    return {
      messages: [
        new AIMessage(
          'Sorry, I encountered an error while displaying the hotels. Please try again.'
        ),
      ],
    };
  }
}
