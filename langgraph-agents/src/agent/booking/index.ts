import { StateGraph, START, END } from '@langchain/langgraph';
import { BookingAnnotation, BookingState } from './types';
import {
  searchTripDestination,
  displayTripDestination,
  searchHotelsByDestination,
  displayHotelsByDestination,
  selectHotel,
  processStripe,
  payStripe,
  summarizeTrip,
  classifyTripRequest,
} from './tools';

// Router function to handle tool calls and route to appropriate nodes
const payStripeRouter = (state: BookingState) => {
  // Check if booking is confirmed
  const activeTrip = state.trips?.[state.activeTripIndex || 0];

  if (activeTrip?.bookingConfirmedOrCanceled) {
    return 'summarizeTrip';
  } else {
    return END;
  }
};

const classifyRouter = (state: BookingState) => {
  // Check if classification result indicates new trip request
  if (state.isNewTripRequest === true) {
    return 'searchTripDestination';
  }

  // If not a new trip request, check for other tool calls
  let lastMessage = null;
  for (let i = state.messages.length - 1; i >= 0; i--) {
    const message = state.messages[i];
    if (message.getType() === 'ai' && (message as any).tool_calls?.length > 0) {
      lastMessage = message;
      break;
    }
  }

  if (lastMessage) {
    const toolName = (lastMessage as any).tool_calls?.[0]?.name;

    switch (toolName) {
      case 'submit_hotel_form':
        return 'searchHotelsByDestination';
      case 'select_hotel':
        return 'selectHotel';
      case 'stripe_processing':
        return 'processStripe';
      case 'stripe_payment':
        return 'payStripe';
    }
  }

  return END;
};

const builder = new StateGraph(BookingAnnotation)
  .addNode('classifyTripRequest', classifyTripRequest)
  .addNode('searchTripDestination', searchTripDestination)
  .addNode('displayTripDestination', displayTripDestination)
  .addNode('searchHotelsByDestination', searchHotelsByDestination)
  .addNode('displayHotelsByDestination', displayHotelsByDestination)
  .addNode('selectHotel', selectHotel)
  .addNode('processStripe', processStripe)
  .addNode('payStripe', payStripe)
  .addNode('summarizeTrip', summarizeTrip)
  .addEdge(START, 'classifyTripRequest')
  .addConditionalEdges('classifyTripRequest', classifyRouter, [
    'searchTripDestination',
    'searchHotelsByDestination',
    'selectHotel',
    'processStripe',
    'payStripe',
    END,
  ])
  .addEdge('searchTripDestination', 'displayTripDestination')
  .addEdge('displayTripDestination', END)
  .addEdge('searchHotelsByDestination', 'displayHotelsByDestination')
  .addEdge('displayHotelsByDestination', END)
  .addEdge('selectHotel', END)
  .addEdge('processStripe', END)
  .addConditionalEdges('payStripe', payStripeRouter, ['summarizeTrip', END])
  .addEdge('summarizeTrip', END);

export const agent = builder.compile();
agent.name = 'Booking Agent';

/*

I want to travel to Egypt.

I am planning to spend my holiday in Italy.

Can we change the trip to Spain instead?

Let’s start over, I want to go to Greece.

Book me a trip to Japan.

I’m thinking about visiting Canada this summer.

Actually, I’d like to go to Dubai instead.

Forget that, I want to plan a trip to Thailand.

*/
