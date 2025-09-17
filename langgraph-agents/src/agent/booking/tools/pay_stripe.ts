import Stripe from 'stripe';
import { BookingState, BookingUpdate } from '../types';
import { createToolResponse } from '../../utils/create-tool-response';
import { AIMessage } from '@langchain/core/messages';

export async function payStripe(state: BookingState): Promise<BookingUpdate> {
  // Check if trips exist in state
  if (!state.trips || state.trips.length === 0) {
    return {
      messages: [new AIMessage('No trips found. Please create a trip first.')],
    };
  }

  // Get the active trip
  const activeTrip = state.trips[state.activeTripIndex || 0];

  if (!activeTrip?.selectedHotel) {
    return {
      messages: [
        new AIMessage(
          'No hotel selected. Please select a hotel before processing payment.'
        ),
      ],
    };
  }

  try {
    // Get the last message to extract payment parameters
    const lastMessage = state.messages[state.messages.length - 1];

    if (
      !lastMessage ||
      lastMessage.getType() !== 'ai' ||
      !(lastMessage as any).tool_calls?.length
    ) {
      return {
        messages: [
          new AIMessage(
            'No payment information found. Please complete the payment process.'
          ),
        ],
      };
    }

    if (!process.env.STRIPE_KEY) {
      return {
        messages: [
          new AIMessage(
            'Stripe key not found. Please set the STRIPE_KEY environment variable.'
          ),
        ],
      };
    }

    const stripe = new Stripe(process.env.STRIPE_KEY, {
      apiVersion: '2020-08-27',
    });
    // Extract payment parameters from the tool call
    const aiMessage = lastMessage as any;
    const toolCall = aiMessage.tool_calls?.[0];
    const paymentData = toolCall?.args;

    if (!paymentData?.token) {
      return {
        messages: [
          new AIMessage(
            'No payment token found. Please provide a valid payment token.'
          ),
        ],
      };
    }

    // Process the Stripe payment
    const selectedHotel = activeTrip.selectedHotel;
    const hotelName = selectedHotel.property.name;
    const price = +paymentData.price.toFixed(2);
    const currency = paymentData.currency;

    // Debug payment data
    console.log('Payment data:', paymentData);

    // Process Stripe payment
    const charge = await stripe.charges.create({
      amount: Math.round(price * 100),
      currency: currency.toLowerCase(),
      source: paymentData.token.id,
    });

    console.log({ charge });

    // Update the trip with booking confirmation
    const updatedTrips = [...state.trips];
    const tripIndex = state.activeTripIndex || 0;

    if (updatedTrips[tripIndex]) {
      updatedTrips[tripIndex] = {
        ...updatedTrips[tripIndex],
        bookingConfirmedOrCanceled: true,
      };
    }

    return {
      messages: [
        createToolResponse(
          toolCall.id || '',
          `Payment processed successfully! Your booking at ${hotelName} for ${currency} ${price} has been confirmed. You will receive a confirmation email shortly.`
        ),
      ],
      trips: updatedTrips,
      activeTripIndex: tripIndex,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Error processing Stripe payment:', error);
    return {
      messages: [
        new AIMessage(
          'Sorry, there was an error processing your payment. Please try again or contact support.'
        ),
      ],
    };
  }
}
