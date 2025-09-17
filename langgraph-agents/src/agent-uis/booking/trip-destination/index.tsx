import { v4 as uuidv4 } from 'uuid';
import { useArtifact } from '@/agent-uis/utils/use-artifact';
import {
  Destination,
  DestinationData,
  HotelSearchParams,
} from '@/agent/booking/types';
import { useState, useRef, useEffect } from 'react';
import { UIMessage, useStreamContext } from '@langchain/langgraph-sdk/react-ui';
import { Message } from '@langchain/langgraph-sdk';
import DateValidationDialog from './dateValidationDialog';
import HotelSearchPanel from './hotelSearchPanel';
import { useStyles, TRIP_DESTINATION_STYLES } from '../../utils/useStyles';

export default function TripDestination({
  destination,
}: {
  destination: Destination;
}) {
  const [selectedDestination, setSelectedDestination] = useState<Destination>();
  const [selectedDestinationData, setSelectedDestinationData] =
    useState<DestinationData>();
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [childrenAges, setChildrenAges] = useState<number[]>([]);
  const [rooms, setRooms] = useState(1);
  const [showDateDialog, setShowDateDialog] = useState(false);
  const [dateError, setDateError] = useState<string>('');

  const [, { open, setOpen }] = useArtifact();

  const thread = useStreamContext<
    { messages: Message[]; ui: UIMessage[] },
    { MetaType: { ui: UIMessage | undefined } }
  >();

  const divRef = useStyles('trip-destination-styles', TRIP_DESTINATION_STYLES);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Reset component state when destination prop changes
  useEffect(() => {
    if (destination && destination.data && destination.data.length > 0) {
      setSelectedDestination(destination);
      setSelectedDestinationData(destination.data[0]);
      setArrivalDate('');
      setDepartureDate('');
      setAdults(1);
      setChildren(0);
      setChildrenAges([]);
      setRooms(1);
      setShowDateDialog(false);
      setDateError('');
    }
  }, [destination]);

  const resetFormState = () => {
    setArrivalDate('');
    setDepartureDate('');
    setAdults(1);
    setChildren(0);
    setChildrenAges([]);
    setRooms(1);
    setShowDateDialog(false);
    setDateError('');
  };

  const handleCardClick = (destinationData: DestinationData) => {
    setSelectedDestinationData(destinationData);
    setOpen(open => !open);
  };

  const handleAdultsChange = (increment: number) => {
    const newValue = adults + increment;
    if (newValue >= 1 && newValue <= 30) {
      setAdults(newValue);
    }
  };

  const handleChildrenChange = (increment: number) => {
    const newValue = children + increment;
    if (newValue >= 0 && newValue <= 10) {
      setChildren(newValue);

      // Update children ages array
      if (newValue > children) {
        // Adding children - add new age entries
        setChildrenAges(prev => [...prev, 0]);
      } else if (newValue < children) {
        // Removing children - remove last age entry
        setChildrenAges(prev => prev.slice(0, newValue));
      }
    }
  };

  const handleChildAgeChange = (index: number, age: string) => {
    setChildrenAges(prev => {
      const newAges = [...prev];
      newAges[index] = parseInt(age.toString());
      return newAges;
    });
  };

  const handleSearchHotels = () => {
    // Validate that both dates are selected
    if (!arrivalDate || !departureDate) {
      setDateError(
        'Please select both Arrival Date and Departure Date before searching for hotels.'
      );
      setShowDateDialog(true);
      return;
    }

    // Validate date logic
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    const arrival = new Date(arrivalDate);
    const departure = new Date(departureDate);

    // Check if dates are in the past
    if (
      arrival.getTime() < today.getTime() ||
      departure.getTime() < today.getTime()
    ) {
      setDateError('Please select future dates. Past dates are not allowed.');
      setShowDateDialog(true);
      return;
    }

    // Check if arrival date is same as or after departure date (invalid)
    if (arrival.getTime() >= departure.getTime()) {
      setDateError('Arrival date must be before departure date.');
      setShowDateDialog(true);
      return;
    }

    const formData: HotelSearchParams = {
      arrival_date: arrivalDate,
      departure_date: departureDate,
      dest_id: selectedDestinationData!.dest_id,
      search_type: selectedDestinationData!.dest_type,
      adults: adults,
      room_qty: rooms,
      currency_code: 'USD',
      location: 'US',
      languagecode: 'en-us',
      temperature_unit: 'c',
      units: 'metric',
      page_number: 1,
    };

    if (children > 0) {
      formData.children_age = childrenAges.join(',').replace(/,/g, '%2C');
    }

    console.log('Search Hotels Form Data:', formData);

    handleSubmit(formData);
  };

  const handleSubmit = (formData: HotelSearchParams) => {
    thread.submit({
      messages: [
        {
          type: 'ai',
          id: uuidv4(),
          content: '',
          tool_calls: [
            {
              name: 'submit_hotel_form',
              args: formData,
              id: uuidv4(),
              type: 'tool_call',
            },
          ],
        },
      ],
    });
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="trip-destination" ref={divRef}>
      {/* Carousel */}
      <div className="d-flex flex-row justify-content-end mb-4">
        <div
          style={{
            width: 'calc(80% + 50px)',
            position: 'relative',
            marginRight: '20px',
          }}
        >
          {/* Left Arrow */}
          <button className="scroll-arrow scroll-left" onClick={scrollLeft}>
            <i className="fas fa-chevron-left"></i>
          </button>

          {/* Right Arrow */}
          <button className="scroll-arrow scroll-right" onClick={scrollRight}>
            <i className="fas fa-chevron-right"></i>
          </button>

          {/* Carousel wrapper */}
          <div
            id="destinationsCarousel"
            className="carousel slide"
            data-mdb-ride="carousel"
            data-mdb-carousel-init
          >
            {/* Inner */}
            <div className="carousel-inner">
              {/* Single slide with all destinations in one row */}
              <div className="carousel-item active">
                <div
                  className="d-flex justify-content-start"
                  style={{ gap: '16px', flexWrap: 'nowrap', overflowX: 'auto' }}
                  ref={scrollContainerRef}
                >
                  {destination.data.map((dest, index) => (
                    <div
                      key={index}
                      className="destination-card"
                      style={{
                        width: '180px',
                        flex: '0 0 auto',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleCardClick(dest)}
                    >
                      {dest.image_url ? (
                        <img
                          src={dest.image_url}
                          className="d-block w-100"
                          alt={dest.name}
                          style={{
                            height: '120px',
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
                          display: dest.image_url ? 'none' : 'flex',
                          height: '120px',
                          border: '2px dashed #ccc',
                          borderRadius: '8px',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#f8f9fa',
                          color: '#6c757d',
                          fontSize: '0.8rem',
                          textAlign: 'center',
                          padding: '10px',
                        }}
                      >
                        No Image Available
                      </div>
                      <div className="destination-info mt-2">
                        <h6
                          className="mb-1"
                          style={{ fontSize: '0.9rem' }}
                          title={`Destination: ${dest.name}`}
                        >
                          {dest.name}
                        </h6>
                        <p
                          className="mb-1"
                          style={{ fontSize: '0.75rem', color: '#666' }}
                          title={`Location: ${dest.label}`}
                        >
                          {dest.label}
                        </p>
                        <small
                          style={{ fontSize: '0.7rem', color: '#888' }}
                          title={`Available: ${dest.hotels} hotels`}
                        >
                          {dest.hotels} hotels
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Inner */}
          </div>
          {/* Carousel wrapper */}
        </div>
      </div>
      {/* Right Side Panel */}
      <HotelSearchPanel
        selectedDestination={selectedDestination}
        setSelectedDestinationData={setSelectedDestinationData}
        selectedDestinationData={selectedDestinationData}
        open={open}
        setOpen={setOpen}
        arrivalDate={arrivalDate}
        setArrivalDate={setArrivalDate}
        departureDate={departureDate}
        setDepartureDate={setDepartureDate}
        adults={adults}
        handleAdultsChange={handleAdultsChange}
        children={children}
        handleChildrenChange={handleChildrenChange}
        childrenAges={childrenAges}
        handleChildAgeChange={handleChildAgeChange}
        rooms={rooms}
        setRooms={setRooms}
        handleSearchHotels={handleSearchHotels}
        resetFormState={resetFormState}
      />

      {/* Date Validation Dialog */}
      <DateValidationDialog
        showDateDialog={showDateDialog}
        setShowDateDialog={setShowDateDialog}
        errorMessage={dateError}
      />
    </div>
  );
}
