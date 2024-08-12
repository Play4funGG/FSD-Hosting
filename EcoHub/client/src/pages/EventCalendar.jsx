import React, { useState, useEffect, useRef } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import http from '../http';
import '../App.css';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const localizer = momentLocalizer(moment);

const Calendar = ({ onSelectEvent }) => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef();
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await http.get('/events');
        const { upcomingEvents, pastEvents } = response.data;
        
        const allEvents = [...upcomingEvents, ...pastEvents];
        
        const formattedEvents = allEvents.map(event => ({
          id: event.event_id,
          title: event.event_title,
          start: new Date(event.event_date + 'T' + event.event_start_time),
          end: new Date(event.event_date + 'T' + event.event_end_time),
        }));
  
        setEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
  
    fetchEvents();
  }, []);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setShowModal(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleViewDetails = () => {
    navigate(`/events/details/${selectedEvent?.id}`); // Navigate to the event detail page
  };

  return (
    <div className='bg-white rounded-lg' onClick={handleClickOutside}>
      <div className="breadcrumbs text-2xl md-6 pl-4 pt-4">
            <ul>
                <li><button onClick={() => navigate('/')}>Home</button></li> 
                <li>Events Calendar</li> 
            </ul>
        </div>
      {showModal && (
        <>
          <div ref={modalRef} style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(128, 128, 128, 0.5)', // Translucent grey overlay
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '5px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              zIndex: 1
            }}>
              <strong className='underline bold'>Event Details</strong>
              <h2><strong>Event Name:</strong> {selectedEvent?.title}</h2>
              <p><strong>Date:</strong> {moment(selectedEvent?.start).format('MMMM DD, YYYY')}</p>
              <p><strong>Time:</strong> {moment(selectedEvent?.start).format('LT')} - {moment(selectedEvent?.end).format('LT')}</p>
              <button type="button" style={{ padding: 5, borderRadius: 5, textDecoration: 'none', background: 'green', color: 'white', cursor: 'pointer' }} onClick={handleViewDetails}>
                View Details
              </button>
              <p></p>
              <button onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </>
      )}
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 900, padding: 20 }}
        onSelectEvent={handleSelectEvent}
        dayLayoutAlgorithm="no-overlap"
        weekLayoutAlgorithm="no-overlap"
      />
    </div>
  );
};

export default Calendar;
