import React, { useState } from 'react';
import { BookingState } from '@/agent/booking/types';
import { v4 as uuidv4 } from 'uuid';
import { Hotel } from '@/agent/booking/types';
import { useArtifact } from '@/agent-uis/utils/use-artifact';
import { UIMessage, useStreamContext } from '@langchain/langgraph-sdk/react-ui';
import { Message } from '@langchain/langgraph-sdk';

interface HotelDetailsPanelProps {
  selectedHotel: Hotel | undefined;
  open: boolean;
  setOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  setSelectedHotel: (hotel: Hotel | undefined) => void;
  tripId?: string;
}

const HotelDetailsPanel: React.FC<HotelDetailsPanelProps> = ({
  selectedHotel,
  open,
  setOpen,
  setSelectedHotel,
  tripId,
}) => {
  if (!open || !selectedHotel) {
    return null;
  }

  const thread = useStreamContext<
    { messages: Message[]; ui: UIMessage[] },
    { MetaType: { ui: UIMessage | undefined } }
  >();

  // Get bookingConfirmedOrCanceled from thread state using tripId
  const threadValues = thread.values as unknown as BookingState;
  const currentTrip = tripId
    ? threadValues?.trips?.find(trip => trip.tripId === tripId)
    : null;
  const bookingConfirmedOrCanceled =
    currentTrip?.bookingConfirmedOrCanceled || false;

  const [Artifact] = useArtifact();
  const [termsAccepted, setTermsAccepted] = useState(false);

  function generateOSMEmbedURL(lat: number, lon: number, sizeKm: number = 1) {
    // Use a simpler approach that works reliably with OpenStreetMap
    // Create a bounding box around the point
    const latOffset = sizeKm / 111; // 1 degree latitude ≈ 111 km
    const lonOffset = sizeKm / (111 * Math.cos((lat * Math.PI) / 180));

    const minLat = lat - latOffset;
    const maxLat = lat + latOffset;
    const minLon = lon - lonOffset;
    const maxLon = lon + lonOffset;

    // Format the bounding box for the URL
    const bbox = `${minLon.toFixed(6)},${minLat.toFixed(6)},${maxLon.toFixed(6)},${maxLat.toFixed(6)}`;

    // Use the bbox parameter which is more reliable for showing the area
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat.toFixed(6)},${lon.toFixed(6)}`;
  }

  const handleSubmit = () => {
    setOpen(false);

    thread.submit(
      {
        messages: [
          {
            type: 'ai',
            id: uuidv4(),
            content: '',
            tool_calls: [
              {
                name: 'select_hotel',
                args: selectedHotel,
                id: uuidv4(),
                type: 'tool_call',
              },
            ],
          },
        ],
      },
      {
        config: {
          configurable: {
            terms: {
              accepted: termsAccepted,
            },
          },
        },
      }
    );
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
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <div
          className="d-flex flex-column h-100"
          style={{ padding: '1.5rem 1.5rem 1.5rem 0.75rem' }}
        >
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0 text-center flex-grow-1">Hotel Details</h5>
            <button
              className="btn-close"
              onClick={() => {
                setOpen(false);
                setSelectedHotel(undefined);
              }}
            ></button>
          </div>

          {/* Hotel Image */}
          <div className="mb-3">
            {selectedHotel.property.photoUrls &&
            selectedHotel.property.photoUrls.length > 0 ? (
              <img
                src={selectedHotel.property.photoUrls[0]}
                className="w-100 rounded"
                alt={selectedHotel.property.name}
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
                display:
                  selectedHotel.property.photoUrls &&
                  selectedHotel.property.photoUrls.length > 0
                    ? 'none'
                    : 'flex',
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
          <div
            className="flex-grow-1"
            style={{ overflowY: 'auto', overflowX: 'hidden' }}
          >
            <h4 className="mb-3 text-center">{selectedHotel.property.name}</h4>

            {/* Hotel Rating and Reviews */}
            {selectedHotel.property.reviewScore > 0 && (
              <div className="mb-3 text-center">
                <span className="badge bg-primary me-2 fs-6">
                  {selectedHotel.property.reviewScore}{' '}
                  {selectedHotel.property.reviewScoreWord}
                </span>
                <small className="text-muted">
                  ({selectedHotel.property.reviewCount} reviews)
                </small>
              </div>
            )}

            {/* Star Rating */}
            {selectedHotel.property.accuratePropertyClass > 0 && (
              <div className="mb-3 text-center">
                <span className="text-warning fs-4">
                  {'★'.repeat(selectedHotel.property.accuratePropertyClass)}
                </span>
                <small className="text-muted d-block">
                  {selectedHotel.property.accuratePropertyClass} star hotel
                </small>
              </div>
            )}

            {/* Price Information */}
            {selectedHotel.property.priceBreakdown &&
              selectedHotel.property.priceBreakdown.grossPrice && (
                <div className="mb-3 text-center">
                  <div className="alert alert-success">
                    <h5 className="mb-1">
                      {
                        selectedHotel.property.priceBreakdown.grossPrice
                          .currency
                      }{' '}
                      {Math.round(
                        selectedHotel.property.priceBreakdown.grossPrice.value
                      )}
                    </h5>
                    <small>per night</small>
                  </div>
                </div>
              )}

            {/* Check-in/Check-out Times */}
            <div className="mb-3">
              <div className="row text-center">
                <div className="col-6">
                  <small className="text-muted d-block">Check-in</small>
                  <strong>{selectedHotel.property.checkin.fromTime}</strong>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">Check-out</small>
                  <strong>{selectedHotel.property.checkout.untilTime}</strong>
                </div>
              </div>
            </div>

            {/* Hotel Information */}
            <div className="mb-3">
              <h6 className="mb-3 text-center text-primary">
                <i className="fas fa-info-circle me-2"></i>
                Hotel Information
              </h6>
            </div>

            {/* Accessibility Information */}
            {selectedHotel.accessibilityLabel && (
              <div className="mb-3 text-left">
                <div className="alert alert-info">
                  <i className="fas fa-universal-access me-2"></i>
                  {selectedHotel.accessibilityLabel}
                </div>
              </div>
            )}

            {/* Hotel Location Map */}
            {selectedHotel.property.latitude &&
              selectedHotel.property.longitude && (
                <div className="mb-3">
                  <h6 className="mb-3 text-center text-primary">
                    <i className="fas fa-map-marker-alt me-2"></i>
                    Hotel Location
                  </h6>
                  <div className="card border-0 shadow-sm">
                    <div className="card-body p-0">
                      <iframe
                        src={generateOSMEmbedURL(
                          selectedHotel.property.latitude,
                          selectedHotel.property.longitude
                        )}
                        width="100%"
                        height="200"
                        style={{ border: 'none', borderRadius: '8px' }}
                        title="Hotel Location Map"
                      />
                    </div>
                  </div>
                </div>
              )}

            {/* Terms and Conditions */}
            <div className="mb-3">
              <div className="form-check" style={{ paddingLeft: '2.2rem' }}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="termsCheckbox"
                  checked={termsAccepted}
                  onChange={e => setTermsAccepted(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="termsCheckbox">
                  <small className="text-muted">
                    I accept the{' '}
                    <a href="#" className="text-primary">
                      Terms and Conditions
                    </a>{' '}
                    and
                    <a href="#" className="text-primary">
                      {' '}
                      Privacy Policy
                    </a>
                    . By proceeding with this booking, I acknowledge that I have
                    read and agree to the hotel's cancellation policy and
                    understand that charges may apply for modifications or
                    cancellations.
                  </small>
                </label>
              </div>
            </div>
          </div>

          {/* Select Hotel Button - Always at bottom */}
          <div className="mt-3">
            <button
              type="button"
              className="btn btn-primary w-100"
              onClick={handleSubmit}
              disabled={bookingConfirmedOrCanceled}
            >
              <>
                <i className="fas fa-check me-2"></i>
                Select Hotel
              </>
            </button>
          </div>
        </div>
      </div>
    </Artifact>
  );
};

export default HotelDetailsPanel;
