import { Hotel } from '@/agent/booking/types';
import { useState } from 'react';
import HotelDetailsPanel from './hotelDetailsPanel';
import { useArtifact } from '@/agent-uis/utils/use-artifact';
import { useStyles, TRIP_DESTINATION_STYLES } from '../../utils/useStyles';

export default function HotelsByDestination({
  hotels,
  tripId,
}: {
  hotels: Hotel[];
  tripId?: string;
}) {
  const [selectedHotel, setSelectedHotel] = useState<Hotel>();

  const [, { open, setOpen }] = useArtifact();

  const divRef = useStyles('trip-destination-styles', TRIP_DESTINATION_STYLES);

  const handleCardClick = ({ hotel }: { hotel: Hotel }) => {
    setSelectedHotel(hotel);
    setOpen(open => !open);
  };

  return (
    <div className="trip-destination" ref={divRef}>
      <div className="d-flex flex-row justify-content-end">
        <div>
          <p
            className="small p-2 ms-3 me-3 rounded-3"
            style={{ backgroundColor: '#f5f6f7' }}
          >
            <strong>Found {hotels.length} hotels</strong>
          </p>
        </div>
      </div>

      <div className="d-flex flex-row justify-content-end">
        <div
          style={{
            width: 'calc(80% + 100px)',
            position: 'relative',
            marginRight: '20px',
          }}
        >
          <div
            className="d-flex flex-column gap-3"
            style={{ marginBottom: '1rem' }}
          >
            {hotels.map((hotel, index) => (
              <div
                key={index}
                className="card"
                style={{
                  maxWidth: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => handleCardClick({ hotel })}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}
              >
                <div className="card-body p-3">
                  <div className="d-flex gap-3">
                    {/* Hotel Photo */}
                    <div
                      style={{ width: '120px', height: '120px', flexShrink: 0 }}
                    >
                      {hotel.property.photoUrls &&
                      hotel.property.photoUrls.length > 0 ? (
                        <img
                          src={hotel.property.photoUrls[0]}
                          alt={hotel.property.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '8px',
                          }}
                          onError={e => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const nextSibling =
                              target.nextSibling as HTMLElement;
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
                            hotel.property.photoUrls &&
                            hotel.property.photoUrls.length > 0
                              ? 'none'
                              : 'flex',
                          width: '100%',
                          height: '100%',
                          border: '2px dashed #ccc',
                          borderRadius: '8px',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#f8f9fa',
                          color: '#6c757d',
                          fontSize: '0.7rem',
                          textAlign: 'center',
                          padding: '5px',
                        }}
                      >
                        No Photo
                      </div>
                    </div>

                    {/* Hotel Info */}
                    <div className="flex-grow-1">
                      <h6
                        className="card-title mb-2"
                        style={{ fontSize: '1rem', fontWeight: '600' }}
                      >
                        {hotel.property.name}
                      </h6>

                      <div className="d-flex align-items-center mb-2">
                        {hotel.property.reviewScore > 0 && (
                          <>
                            <span className="badge bg-primary me-2">
                              {hotel.property.reviewScore}{' '}
                              {hotel.property.reviewScoreWord}
                            </span>
                            <small className="text-muted">
                              ({hotel.property.reviewCount} reviews)
                            </small>
                          </>
                        )}
                      </div>

                      <div className="mb-2">
                        {hotel.property.accuratePropertyClass > 0 && (
                          <div className="d-flex align-items-center mb-1">
                            <span className="text-warning me-1">
                              {'★'.repeat(hotel.property.accuratePropertyClass)}
                            </span>
                            <small className="text-muted">
                              {hotel.property.accuratePropertyClass} star hotel
                            </small>
                          </div>
                        )}
                      </div>

                      <div className="d-flex justify-content-between align-items-end">
                        <div>
                          {hotel.property.priceBreakdown &&
                            hotel.property.priceBreakdown.grossPrice && (
                              <div>
                                <span className="h5 text-success mb-0">
                                  {
                                    hotel.property.priceBreakdown.grossPrice
                                      .currency
                                  }{' '}
                                  {Math.round(
                                    hotel.property.priceBreakdown.grossPrice
                                      .value
                                  )}
                                </span>
                                <small className="text-muted d-block">
                                  per night
                                </small>
                              </div>
                            )}
                        </div>

                        <div className="text-end">
                          <small className="text-muted d-block">
                            Check-in: {hotel.property.checkin.fromTime}
                          </small>
                          <small className="text-muted">
                            Check-out: {hotel.property.checkout.untilTime}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hotel Details Panel */}
      <HotelDetailsPanel
        selectedHotel={selectedHotel}
        open={open}
        setOpen={setOpen}
        setSelectedHotel={setSelectedHotel}
        tripId={tripId}
      />
    </div>
  );
}
