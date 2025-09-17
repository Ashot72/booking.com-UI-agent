import { BookingState, BookingUpdate } from '../types';
import { AIMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';

export async function summarizeTrip(
  state: BookingState
): Promise<BookingUpdate> {
  // Check if trips exist in state
  if (!state.trips || state.trips.length === 0) {
    return {
      messages: [new AIMessage('No trips found to summarize.')],
    };
  }

  try {
    // Get the active trip
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

    const SUMMARIZATION_PROMPT = `You are a helpful travel assistant. Based on the conversation history, the user has:
            1. Selected a trip destination
            2. Chosen a hotel
            3. Completed payment via Stripe

            Please generate a comprehensive trip summary that includes:
            - Destination details
            - Selected hotel information
            - Payment confirmation
            - Next steps or confirmation details

            Make it friendly, professional, and celebratory since they've completed their booking.
            
             If the content includes an image path, please put it int the img tag 
             <div style="text-align: center;">
                 <img src="image_path" alt="trip image" width="400" height="400" style="border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"/>
             </div> 
             instead of just the image path `;

    const model = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0.7,
    });

    // Find messages after the last classify_trip_request tool response
    const classifyTripIndex = state.messages.findLastIndex(
      msg =>
        msg.name === 'classify_trip_request' ||
        (msg.getType() === 'ai' &&
          'tool_calls' in msg &&
          (msg as any).tool_calls?.some(
            (tc: any) => tc.name === 'classify_trip_request'
          ))
    );

    const relevantMessages =
      classifyTripIndex >= 0
        ? state.messages.slice(classifyTripIndex + 1)
        : state.messages;

    const response = await model.invoke([
      {
        role: 'system',
        content: SUMMARIZATION_PROMPT,
      },
      ...relevantMessages,
    ]);

    return {
      messages: [response],
    };
  } catch (error) {
    console.error('Error summarizing trip:', error);
    return {
      messages: [
        new AIMessage(
          'Sorry, there was an error generating your trip summary. Please try again.'
        ),
      ],
    };
  }
}
