import { SupervisorAnnotation } from '../supervisor/types';

// types/destination.ts

export type DestinationData = {
  dest_type: string; // e.g. "city", "district"
  cc1: string; // country code
  city_name: string;
  label: string; // full display label
  longitude: number;
  latitude: number;
  type: string; // "ci" or "di"
  region: string;
  city_ufi: number | null; // may be null
  name: string;
  roundtrip: string;
  country: string;
  image_url: string;
  dest_id: string;
  nr_hotels: number;
  lc: string; // language code
  hotels: number;
};

export type Destination = {
  status: boolean;
  message: string;
  timestamp: number;
  tripId: string;
  data: DestinationData[];
};

// types/hotels.ts

export interface PriceBreakdown {
  grossPrice: Price;
  strikethroughPrice?: Price;
  benefitBadges: any[]; // can be typed later if schema is known
  taxExceptions: any[]; // can be typed later if schema is known
}

export interface Price {
  currency: string; // e.g. "INR"
  value: number;
}

export interface TimeRange {
  fromTime: string; // e.g. "14:00"
  untilTime: string; // e.g. "00:00"
}

export interface HotelProperty {
  id: number;
  name: string;
  ufi: number;
  countryCode: string;
  currency: string;
  latitude: number;
  longitude: number;
  position: number;
  rankingPosition: number;
  reviewCount: number;
  reviewScore: number;
  reviewScoreWord: string;
  accuratePropertyClass: number;
  propertyClass: number;
  qualityClass: number;
  isPreferred?: boolean;
  isFirstPage: boolean;
  wishlistName: string;
  checkin: TimeRange;
  checkout: TimeRange;
  checkinDate: string; // YYYY-MM-DD
  checkoutDate: string; // YYYY-MM-DD
  photoUrls: string[];
  mainPhotoId: number;
  priceBreakdown: PriceBreakdown;
  blockIds: string[];
  optOutFromGalleryChanges: number;
}

export interface HotelInfo {
  description: string;
  languagecode: string;
  descriptiontype_id: number;
  hotel_id: string;
}

export interface HotelInfoData {
  status: boolean;
  message: string;
  timestamp: number;
  data: HotelInfo[];
}

export interface HotelInfoParams {
  hotel_id: string;
  languagecode: string;
}

export interface Hotel {
  accessibilityLabel: string;
  property: HotelProperty;
}

export interface HotelData {
  data: {
    hotels: Hotel[];
  };
}

export interface HotelSearchParams {
  arrival_date: string;
  departure_date: string;
  dest_id: string;
  search_type: string;
  adults: number;
  children_age?: number[] | string;
  room_qty: number;
  currency_code: string;
  location: string;
  languagecode: string;
  temperature_unit: string;
  units: string;
  page_number: number;
}

export type Booking = {
  tripId: string;
  destination: Destination;
  hotels: HotelData[];
  selectedHotel?: Hotel;
  bookingConfirmedOrCanceled?: boolean;
};

export const BookingAnnotation = SupervisorAnnotation;

export type BookingState = typeof BookingAnnotation.State;
export type BookingUpdate = typeof BookingAnnotation.Update;
