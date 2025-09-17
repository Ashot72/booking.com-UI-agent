import { LangGraphRunnableConfig } from '@langchain/langgraph';
import { v4 as uuidv4 } from 'uuid';
import { AIMessage } from '@langchain/core/messages';
import { createToolResponse } from '../../utils/create-tool-response';
import { BookingState, BookingUpdate, Hotel } from '../types';

export async function selectHotel(
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
    // Find the last AI message with tool calls (search backwards)
    let lastMessageWithToolCall = null;
    for (let i = state.messages.length - 1; i >= 0; i--) {
      const message = state.messages[i];
      if (
        message.getType() === 'ai' &&
        (message as AIMessage).tool_calls?.length
      ) {
        lastMessageWithToolCall = message as AIMessage;
        break;
      }
    }

    // Check terms acceptance from config
    const termsAccepted = config?.configurable?.terms?.accepted;
    if (!termsAccepted) {
      if (lastMessageWithToolCall?.tool_calls?.[0]?.id) {
        // If there's a valid tool call, respond to it
        return {
          messages: [
            createToolResponse(
              lastMessageWithToolCall.tool_calls[0].id,
              'Terms and conditions not accepted.'
            ),
            new AIMessage(
              'Terms and conditions not accepted. Please accept the terms and conditions to select a hotel.'
            ),
          ],
        };
      } else {
        // If no tool call, just return AI message
        return {
          messages: [
            new AIMessage(
              'Terms and conditions not accepted. Please accept the terms and conditions to select a hotel.'
            ),
          ],
        };
      }
    }

    if (!lastMessageWithToolCall) {
      return {
        messages: [
          new AIMessage(
            'No hotel selection found. Please select a hotel from the list.'
          ),
        ],
      };
    }

    // Extract hotel selection from the tool call
    const aiMessage = lastMessageWithToolCall as any;
    const toolCall = aiMessage.tool_calls?.[0];
    const selectedHotel: Hotel = toolCall?.args;

    // Validate that we have valid hotel data
    if (
      !selectedHotel ||
      !selectedHotel.property ||
      !selectedHotel.property.id
    ) {
      return {
        messages: [
          new AIMessage(
            'Invalid hotel data received. Please select a hotel from the list.'
          ),
        ],
      };
    }

    // Update the active trip with selected hotel
    const updatedTrips = [...state.trips];
    const tripIndex = state.activeTripIndex || 0;

    if (updatedTrips[tripIndex]) {
      updatedTrips[tripIndex] = {
        ...updatedTrips[tripIndex],
        selectedHotel: selectedHotel,
      };
    }

    const id = uuidv4();

    return {
      messages: [
        createToolResponse(
          toolCall?.id || '',
          `Hotel "${selectedHotel.property.name}" has been selected for your trip.`
        ),
        new AIMessage({
          content: `Hotel "${selectedHotel.property.name}" has been selected for your trip. Do you need to process the trip using Stripe for payment?`,
          tool_calls: [
            {
              id,
              name: 'stripe_processing',
              args: {},
            },
          ],
        }),
        createToolResponse(id, 'Stripe processing tool call initiated'),
      ],
      trips: updatedTrips,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Error selecting hotel:', error);
    return {
      messages: [
        new AIMessage(
          'Sorry, I encountered an error while selecting the hotel. Please try again.'
        ),
      ],
    };
  }
}
