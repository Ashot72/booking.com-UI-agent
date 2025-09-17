import React from 'react';
import {
  DestinationData,
  BookingState,
  Destination,
} from '@/agent/booking/types';
import { useArtifact } from '@/agent-uis/utils/use-artifact';
import { useStreamContext } from '@langchain/langgraph-sdk/react-ui';
import { Message } from '@langchain/langgraph-sdk';
import { UIMessage } from '@langchain/langgraph-sdk/react-ui';

interface HotelSearchPanelProps {
  selectedDestination: Destination | undefined;
  setSelectedDestinationData: (
    destination: DestinationData | undefined
  ) => void;
  selectedDestinationData: DestinationData | undefined;
  open: boolean;
  setOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  arrivalDate: string;
  setArrivalDate: (date: string) => void;
  departureDate: string;
  setDepartureDate: (date: string) => void;
  adults: number;
  handleAdultsChange: (increment: number) => void;
  children: number;
  handleChildrenChange: (increment: number) => void;
  childrenAges: number[];
  handleChildAgeChange: (index: number, age: string) => void;
  rooms: number;
  setRooms: (rooms: number) => void;
  handleSearchHotels: () => void;
  resetFormState: () => void;
}

const HotelSearchPanel: React.FC<HotelSearchPanelProps> = ({
  selectedDestination,
  setSelectedDestinationData,
  selectedDestinationData,
  open,
  setOpen,
  arrivalDate,
  setArrivalDate,
  departureDate,
  setDepartureDate,
  adults,
  handleAdultsChange,
  children,
  handleChildrenChange,
  childrenAges,
  handleChildAgeChange,
  rooms,
  setRooms,
  handleSearchHotels,
  resetFormState,
}) => {
  if (!open || !selectedDestination || !selectedDestinationData) {
    return null;
  }

  const thread = useStreamContext<
    { messages: Message[]; ui: UIMessage[] },
    { MetaType: { ui: UIMessage | undefined } }
  >();

  // Get bookingConfirmedOrCanceled from thread state
  const threadValues = thread.values as unknown as BookingState;
  // Get tripId from the selectedDestination object
  const destinationTripId = selectedDestination?.tripId;
  const currentTrip = destinationTripId
    ? threadValues?.trips?.find(trip => trip.tripId === destinationTripId)
    : null;
  const bookingConfirmedOrCanceled =
    currentTrip?.bookingConfirmedOrCanceled || false;

  const [Artifact] = useArtifact();

  const handleSearchHotelsWithClose = () => {
    setOpen(false);
    handleSearchHotels();
  };

  return (
    <Artifact>
      <div
        className="position-fixed top-0 end-0 h-100 bg-white shadow-lg"
        style={{
          width: '350px',
          zIndex: 1050,
          transform: 'translateX(0)',
          transition: 'transform 0.3s ease-in-out',
        }}
      >
        <div
          className="p-4 h-100 d-flex flex-column"
          style={{ overflowY: 'auto', overflowX: 'hidden' }}
        >
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0 text-center flex-grow-1">Search Hotels</h5>
            <button
              className="btn-close"
              onClick={() => {
                setOpen(false);
                setSelectedDestinationData(undefined);
                resetFormState();
              }}
            ></button>
          </div>

          {/* Image */}
          <div className="mb-3">
            {selectedDestinationData.image_url ? (
              <img
                src={selectedDestinationData.image_url}
                className="w-100 rounded"
                alt={selectedDestinationData.name}
                style={{ height: '200px', objectFit: 'cover' }}
                onError={e => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const nextSibling = target.nextSibling as HTMLElement;
                  if (nextSibling) {
                    nextSibling.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div
              className="no-image-placeholder"
              style={{
                display: selectedDestinationData.image_url ? 'none' : 'flex',
                height: '200px',
                border: '2px dashed #ccc',
                borderRadius: '8px',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8f9fa',
                color: '#6c757d',
                fontSize: '1rem',
                textAlign: 'center',
                padding: '20px',
              }}
            >
              No Image Available
            </div>
          </div>

          {/* Content */}
          <div className="flex-grow-1">
            <h4 className="mb-3 text-center">{selectedDestinationData.name}</h4>
            <p className="text-muted mb-4">{selectedDestinationData.label}</p>

            {/* Date Controls */}
            <div className="mb-4">
              <h6 className="mb-3">Travel Dates</h6>
              <div className="border rounded p-3">
                <div className="row g-2">
                  <div className="col-6">
                    <label className="form-label small mb-1">
                      Check-in Date
                    </label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      name="arrival_date"
                      value={arrivalDate}
                      onChange={e => setArrivalDate(e.target.value)}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small mb-1">
                      Check-out Date
                    </label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      name="departure_date"
                      value={departureDate}
                      onChange={e => setDepartureDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Guest Controls */}
            <div className="mb-4">
              <h6 className="mb-3">Guests</h6>

              {/* Adults */}
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <span className="fw-medium">Adults</span>
                  <small className="text-muted d-block">Age 17+</small>
                </div>
                <div className="d-flex align-items-center">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '32px', height: '32px' }}
                    onClick={() => handleAdultsChange(-1)}
                    disabled={adults <= 1}
                  >
                    <i className="fas fa-minus"></i>
                  </button>
                  <span className="mx-3 fw-bold" data-name="adults">
                    {adults}
                  </span>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '32px', height: '32px' }}
                    onClick={() => handleAdultsChange(1)}
                    disabled={adults >= 30}
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <span className="fw-medium">Children</span>
                  <small className="text-muted d-block">Age 0-17</small>
                </div>
                <div className="d-flex align-items-center">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '32px', height: '32px' }}
                    onClick={() => handleChildrenChange(-1)}
                    disabled={children <= 0}
                  >
                    <i className="fas fa-minus"></i>
                  </button>
                  <span className="mx-3 fw-bold" data-name="children_age">
                    {children}
                  </span>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '32px', height: '32px' }}
                    onClick={() => handleChildrenChange(1)}
                    disabled={children >= 10}
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </div>

              {/* Child Age Dropdowns */}
              {children > 0 && (
                <div className="mt-2">
                  <small className="text-muted d-block mb-2">Child Ages:</small>
                  <div className="d-flex flex-wrap gap-2">
                    {childrenAges.map((age, index) => (
                      <div key={index} style={{ minWidth: '80px' }}>
                        <select
                          className="form-select form-select-sm"
                          value={age}
                          onChange={e =>
                            handleChildAgeChange(index, e.target.value)
                          }
                          style={{ fontSize: '0.8rem' }}
                        >
                          {Array.from({ length: 18 }, (_, i) => (
                            <option key={i} value={i}>
                              {i} {i === 1 ? 'year' : 'years'}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Room Selection */}
            <div className="mb-4">
              <h6 className="mb-3">Rooms</h6>
              <select
                className="form-select form-select-sm"
                name="room_qty"
                value={rooms}
                onChange={e => setRooms(parseInt(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Room' : 'Rooms'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto">
            <button
              type="button"
              className="btn btn-primary w-100"
              onClick={handleSearchHotelsWithClose}
              disabled={bookingConfirmedOrCanceled}
            >
              <i className="fas fa-search me-2"></i>
              Search Hotels
            </button>
          </div>
        </div>
      </div>
    </Artifact>
  );
};

export default HotelSearchPanel;
