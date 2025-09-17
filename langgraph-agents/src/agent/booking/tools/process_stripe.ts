import { ChatOpenAI } from '@langchain/openai';
import { AIMessage } from '@langchain/core/messages';
import { typedUi } from '@langchain/langgraph-sdk/react-ui/server';
import { LangGraphRunnableConfig } from '@langchain/langgraph';
import { BookingState, BookingUpdate } from '../types';
import type ComponentMap from '../../../agent-uis/index';

export async function processStripe(
  state: BookingState,
  config: LangGraphRunnableConfig
): Promise<BookingUpdate> {
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
    const ui = typedUi<typeof ComponentMap>(config);

    const lastHuman = state.messages.findLast(
      (m: any) => m.getType() === 'human'
    );

    if (!lastHuman)
      return {
        messages: [
          new AIMessage(
            'No human message found. Please confirm if you want to proceed with Stripe payment processing for your selected hotel.'
          ),
        ],
      };

    const model = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0,
    });

    const paymentProcessingMessage =
      'Bringing up secure payment processing for your card now…';

    // Ask LLM to classify the user reply
    const response = await model.invoke([
      {
        role: 'system',
        content: `You are a helpful assistant. Only answer ${paymentProcessingMessage} if the user agrees to process the Stripe payment, 'no' otherwise.`,
      },
      {
        role: 'human',
        content: lastHuman.content,
      },
    ]);

    // Get content from response and convert to string
    const aiContent = response.content?.toString().trim().toLowerCase() || '';

    // Check if LLM classified the response as "yes"
    if (aiContent === paymentProcessingMessage.toLocaleLowerCase()) {
      // Process the Stripe payment
      const selectedHotel = activeTrip.selectedHotel;
      const price = selectedHotel.property.priceBreakdown?.grossPrice?.value;
      const currency =
        selectedHotel.property.priceBreakdown?.grossPrice?.currency;

      ui.push(
        {
          name: 'stripe-processing',
          props: {
            price,
            currency,
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
    }

    if (aiContent === 'no') {
      return {
        messages: [
          new AIMessage(
            'Payment processing for your selected hotel has been cancelled. Go and select a hotel for your trip.'
          ),
        ],
      };
    }
    // If the pattern doesn't match, return a message asking for clarification
    return {
      messages: [
        new AIMessage(
          "I didn't understand your request. Please confirm if you want to proceed with Stripe payment processing for your selected hotel."
        ),
      ],
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
