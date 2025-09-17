import StripeCheckout from 'react-stripe-checkout';
import { v4 as uuidv4 } from 'uuid';
import { UIMessage, useStreamContext } from '@langchain/langgraph-sdk/react-ui';
import { Message } from '@langchain/langgraph-sdk';
import { useStyles, TRIP_DESTINATION_STYLES } from '../../utils/useStyles';
import { BookingState } from '@/agent/booking/types';

interface StripeToken {
  id: string;
  object: string;
  card: {
    id: string;
    object: string;
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  created: number;
  email?: string;
  livemode: boolean;
  type: string;
  used: boolean;
}

interface StripeProcessingProps {
  price: number;
  currency: string;
  tripId?: string;
}

export default function StripeProcessing({
  price,
  currency,
  tripId,
}: StripeProcessingProps) {
  const thread = useStreamContext<
    { messages: Message[]; ui: UIMessage[] },
    { MetaType: { ui: UIMessage | undefined } }
  >();

  // Get bookingConfirmedOrCanceled from thread state
  const threadValues = thread.values as unknown as BookingState;
  const currentTrip = tripId
    ? threadValues?.trips?.find(trip => trip.tripId === tripId)
    : null;
  const bookingConfirmedOrCanceled =
    currentTrip?.bookingConfirmedOrCanceled || false;

  const divRef = useStyles('stripe-processing-styles', TRIP_DESTINATION_STYLES);

  const payments = (token: StripeToken) => {
    console.log('Stripe token received:', token);

    thread.submit({
      messages: [
        {
          type: 'ai',
          id: uuidv4(),
          content: '',
          tool_calls: [
            {
              type: 'tool_call',
              id: uuidv4(),
              name: 'stripe_payment',
              args: { token, price, currency },
            },
          ],
        },
      ],
    });
  };

  return (
    <div className="stripe-processing-container" ref={divRef}>
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-primary mb-2">
          <i className="fas fa-credit-card me-2"></i>
          Secure Payment Processing
        </h2>
        <p className="text-muted">Complete your booking with Stripe</p>
      </div>

      {/* Payment Summary */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title text-center mb-3">
            <i className="fas fa-receipt me-2 text-success"></i>
            Payment Summary
          </h5>
          <div className="text-center">
            <div className="mb-2">
              <span className="fs-5 text-muted">Total Amount</span>
            </div>
            <div>
              <span className="fs-2 fw-bold text-success">
                {currency} {price.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="alert alert-info text-center mb-4" role="alert">
        <i className="fas fa-shield-alt me-2"></i>
        <strong>Secure Payment:</strong> Your payment information is encrypted
        and processed securely by Stripe.
      </div>

      {/* Stripe Checkout */}
      <div
        className="text-center"
        style={{
          pointerEvents: bookingConfirmedOrCanceled ? 'none' : 'auto',
          opacity: bookingConfirmedOrCanceled ? 0.5 : 1,
        }}
      >
        <StripeCheckout
          token={token => payments(token)}
          amount={price * 100}
          stripeKey="pk_test_51KwPjRKVwzOYdWGqjhA8O5jQrUHXmSo8VVJaaOBsEROZKOKqsxNzind6nj1mUTcw68MRXOHxQblzEwc8hv3CxSPT00xDuqVkzU"
        />
      </div>

      {/* Footer */}
      <div className="text-center mt-4">
        <small className="text-muted">
          <i className="fas fa-info-circle me-1"></i>
          Powered by Stripe • SSL Encrypted
        </small>
      </div>
    </div>
  );
}
