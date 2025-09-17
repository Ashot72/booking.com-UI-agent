import { Destination, HotelData, HotelSearchParams } from './types';

// Load configuration from environment variables
const API_KEY = process.env.RAPIDAPI_KEY;
const API_HOST = process.env.RAPIDAPI_HOST || 'booking-com15.p.rapidapi.com';
const BASE_URL =
  process.env.BOOKING_BASE_URL || 'https://booking-com15.p.rapidapi.com';

// Validate required environment variables
if (!API_KEY) {
  throw new Error(
    'RAPIDAPI_KEY environment variable is required. Please set it in your .env file.'
  );
}

const apiConfig = {
  headers: {
    'X-RapidAPI-Key': API_KEY,
    'X-RapidAPI-Host': API_HOST,
    'Content-Type': 'application/json',
  },
};

// Helper function to make API calls
const makeApiCall = async (
  endpoint: string,
  params: Record<string, any> = {}
) => {
  try {
    const url = new URL(`${BASE_URL}${endpoint}`);

    // Add query parameters
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    const response = await fetch(url.href, {
      method: 'GET',
      headers: apiConfig.headers,
    });

    if (!response.ok) {
      throw new Error(
        `API call failed: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Booking.com API endpoints
export const bookingApi = {
  searchDestination: (query: string): Promise<Destination> => {
    return makeApiCall('/api/v1/hotels/searchDestination', { query });
  },

  searchHotels: (query: HotelSearchParams): Promise<HotelData> => {
    return makeApiCall('/api/v1/hotels/searchHotels', query);
  },
};
