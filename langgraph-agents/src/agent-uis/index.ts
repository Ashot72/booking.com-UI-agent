import TripDestination from './booking/trip-destination';
import HotelsByDestination from './booking/hotels_by_destination.tsx';
import StripeProcessing from './booking/stripe-processing/index.tsx';

const ComponentMap = {
  'trip-destination': TripDestination,
  'hotels-by-destination': HotelsByDestination,
  'stripe-processing': StripeProcessing,
} as const;

export default ComponentMap;
