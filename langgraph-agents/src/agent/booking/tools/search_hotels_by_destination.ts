import { AIMessage } from '@langchain/core/messages';
import {
  BookingState,
  BookingUpdate,
  HotelData,
  HotelSearchParams,
} from '../types';
import { bookingApi } from '../booking_api';
import { createToolResponse } from '../../utils/create-tool-response';

export async function searchHotelsByDestination(
  state: BookingState
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
    // Get the last message to extract hotel search parameters
    const lastMessage = state.messages[state.messages.length - 1];

    if (
      !lastMessage ||
      lastMessage.getType() !== 'ai' ||
      !(lastMessage as any).tool_calls?.length
    ) {
      return {
        messages: [
          new AIMessage(
            'No hotel search parameters found. Please submit the hotel search form.'
          ),
        ],
      };
    }

    // Extract search parameters from the tool call
    const aiMessage = lastMessage as AIMessage;
    const toolCall = aiMessage.tool_calls?.[0];
    const hotelSearchParams = toolCall?.args as HotelSearchParams;

    // Call the booking API to search for hotels
    const hotelData: HotelData =
      await bookingApi.searchHotels(hotelSearchParams);

    // Update the active trip with hotels data (clear previous hotels first)
    const updatedTrips = [...state.trips];
    const tripIndex = state.activeTripIndex || 0;

    if (updatedTrips[tripIndex]) {
      updatedTrips[tripIndex] = {
        ...updatedTrips[tripIndex],
        hotels: [hotelData], // Replace previous hotels with new search results
      };
    }

    return {
      messages: [
        createToolResponse(
          toolCall!.id || '',
          `Found ${hotelData.data.hotels.length} hotels for your search. Here are the available options:`
        ),
      ],
      trips: updatedTrips,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Error searching hotels:', error);
    return {
      messages: [
        new AIMessage(
          'Sorry, I encountered an error while searching for hotels. Please try again.'
        ),
      ],
    };
  }
}
