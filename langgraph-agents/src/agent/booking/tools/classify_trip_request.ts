import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { BookingState, BookingUpdate } from '../types';
import { AIMessage } from '@langchain/core/messages';
import { createToolResponse } from '../../utils/create-tool-response';

export async function classifyTripRequest(
  state: BookingState
): Promise<BookingUpdate> {
  const schema = z.object({
    isNewTripRequest: z
      .boolean()
      .describe(
        'Whether the user is requesting a new trip to a different destination'
      ),
  });

  const model = new ChatOpenAI({
    model: 'gpt-4o-mini',
    temperature: 0,
  }).bindTools([
    {
      name: 'classify_trip_request',
      description: 'Classify if the user is requesting a new trip',
      schema,
    },
  ]);

  const prompt = `
        Analyze if the user's message is requesting a NEW trip to a DIFFERENT destination.
        
        Return FALSE (not a new trip) if the user is:
        - Selecting a hotel from search results
        - Confirming hotel choice or booking details
        - Making payment or completing current booking
        - Asking questions about current trip (hotels, dates, prices)
        - Interacting with hotel details or reviews
        - Continuing with the current booking process
        - Making any hotel-related decisions
        - Asking unrelated questions (weather, time, general chat)
        
        Return TRUE (new trip) ONLY if the user explicitly mentions:
        - A completely different destination than what's currently being booked
        - Starting over with a new location
        - Changing from current destination to a new one
        - "I want to go to [different place]" when already booking somewhere else
        - Wanting to go to a different destination
        - Planning a vacation to a specific location
        - Booking a trip to a new place
        - Starting a new travel plan
        - Changing their destination
        
        IMPORTANT: Hotel selection, confirmation, or payment actions are NEVER new trip requests.
        They are part of completing the current trip booking.
    `;

  // Get the last message with content (human or AI)
  const lastMessage = state.messages
    .filter(msg => msg.content && msg.content !== '')
    .pop();

  if (!lastMessage) {
    return {
      messages: [new AIMessage('No message with content found to classify')],
    };
  }

  const messageContent =
    typeof lastMessage.content === 'string'
      ? lastMessage.content
      : JSON.stringify(lastMessage.content);

  try {
    const response = await model.invoke([
      { role: 'system', content: prompt },
      { role: 'human', content: messageContent },
    ]);

    const toolCall = response.tool_calls?.[0];
    if (toolCall) {
      const result = toolCall.args as z.infer<typeof schema>;

      // If this is a new trip request, mark all existing trips as confirmed
      let updatedTrips = state.trips;
      if (result.isNewTripRequest && state.trips && state.trips.length > 0) {
        updatedTrips = state.trips.map(trip => {
          // Mark all existing trips as confirmed when starting a new trip
          return {
            ...trip,
            bookingConfirmedOrCanceled: true,
          };
        });
      }

      if (result.isNewTripRequest) {
        return {
          messages: [
            response,
            createToolResponse(
              toolCall.id || '',
              result.isNewTripRequest
                ? 'Starting new trip booking process...'
                : 'Continuing with current trip booking...',
              'classify_trip_request'
            ),
          ],
          // Store the classification result in state for the router to use
          isNewTripRequest: result.isNewTripRequest,
          trips: updatedTrips,
        };
      } else {
        return {
          messages: [],
          isNewTripRequest: result.isNewTripRequest,
          trips: updatedTrips,
        };
      }
    }

    return {
      messages: [],
    };
  } catch (error) {
    console.error('Error classifying trip request:', error);
    return {
      messages: [
        new AIMessage(
          `Error classifying trip request: ${error instanceof Error ? error.message : 'Unknown error'}`
        ),
      ],
    };
  }
}
