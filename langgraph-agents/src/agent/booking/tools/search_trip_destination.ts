import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { formatMessages } from '../../utils/format-messages';
import { bookingApi } from '../booking_api';
import { BookingState, BookingUpdate, Booking } from '../types';
import { createToolResponse } from '../../utils/create-tool-response';
import { AIMessage } from '@langchain/core/messages';

export async function searchTripDestination(
  state: BookingState
): Promise<BookingUpdate> {
  const schema = z.object({
    location: z
      .string()
      .describe(
        'The location to book the trip for. Can be a city, state, district, landmark or country'
      ),
  });

  const model = new ChatOpenAI({
    model: 'gpt-4o-mini',
    temperature: 0,
  }).bindTools([
    {
      name: 'search_trip_destination',
      description: 'A tool to search the destination for the trip',
      schema,
    },
  ]);

  const prompt = `
          You are an AI assistant for booking trips. Your task is to extract the destination location from the user's message.

          IMPORTANT EXTRACTION RULES:
          1. Look for ANY mention of a place name in the user's message
          2. Accept cities, states, countries, districts, or regions
          3. Be flexible with spelling variations and common abbreviations
          4. Extract the most specific location mentioned (e.g., "New York" not just "York")
          5. If multiple locations are mentioned, extract the primary destination

          EXAMPLES OF VALID LOCATIONS:
          - "I want to go to Paris" → extract "Paris"
          - "Book a trip to Tokyo, Japan" → extract "Tokyo"
          - "Planning a vacation in California" → extract "California"
          - "I'd like to visit the Eiffel Tower" → extract "Eiffel Tower"
          - "Going to NYC" → extract "NYC"
          - "Travel to London, UK" → extract "London"

          ONLY respond with a clarification if NO location is mentioned at all. 
          If you find ANY location reference, extract it even if it seems unclear.
    `;

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
      ? state.messages.slice(classifyTripIndex - 2)
      : state.messages;

  const humanMessage = `Here is the conversation since the last trip classification:\n${formatMessages(relevantMessages)}`;

  const response = await model.invoke([
    { role: 'system', content: prompt },
    { role: 'human', content: humanMessage },
  ]);

  const toolCall = response.tool_calls?.[0];
  if (!toolCall) {
    return {
      messages: [response],
    };
  }

  const extractDetails = toolCall.args as z.infer<typeof schema>;

  // Call the booking API to search for destinations
  try {
    const destination = await bookingApi.searchDestination(
      extractDetails.location
    );
    const tripId = `trip_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    // Set the same tripId on both destination and Booking
    destination.tripId = tripId;

    // Create a new trip with the found destinations
    const newTrip: Booking = {
      tripId: tripId,
      destination: destination,
      hotels: [],
      selectedHotel: null as any,
      bookingConfirmedOrCanceled: false,
    };

    return {
      trips: [...(state.trips || []), newTrip],
      activeTripIndex: state.trips?.length || 0,
      messages: [
        response,
        createToolResponse(
          toolCall.id || '',
          `Found destinations for "${extractDetails.location}": ${destination.data?.length || 0} results`
        ),
      ],
    };
  } catch (error) {
    console.error('Error calling booking API:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      messages: [
        new AIMessage(`Error searching for destinations: ${errorMessage}`),
      ],
    };
  }
}
