import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDateTime } from '../utils';
import http from '../http';

function EventsMain() {
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [pastEvents, setPastEvents] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        http.get('/events')
           .then(res => {
                const now = new Date();
                const upcoming = res.data.upcomingEvents;
                const past = res.data.pastEvents;
                setUpcomingEvents(upcoming);
                setPastEvents(past);
            })
           .catch(error => console.error('Error fetching events:', error));
    }, []);

    const handleViewDetails = (eventId) => {
        navigate(`/events/details/${eventId}`);
    };

    const handleViewUpcoming = (pageNoUp) => {
        navigate(`/events/upcoming/${pageNoUp}`);
    };

    const handleViewPast = (pageNoPast) => {
        navigate(`/events/past/${pageNoPast}`);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="breadcrumbs text-2xl md-6">
                <ul>
                    <li><button onClick={() => navigate('/')}>Home</button></li> 
                    <li>Events Page</li> 
                </ul>
            </div>
            <h2 className="text-2xl font-bold mb-4">Top 3 Upcoming Events</h2>
            {upcomingEvents.map(event => (
                <div key={event.event_id} className="card lg:card-side bg-green-900 shadow-xl mb-6 ">
                    <figure>
                        <img src="https://img.daisyui.com/images/stock/photo-1494232410401-ad00d5433cfa.jpg" alt="Event" />
                    </figure>
                    <div className="card-body text-white">
                        <h3 className="card-title">{event.event_title}</h3>
                        <p>Type: {event.eventType?.event_type_description}</p>
                        <p>Location: {event.eventLocation?.event_location_description}</p>
                        <p>Date: {formatDateTime(event.event_date, event.event_start_time, event.event_end_time)}</p>
                        <p>Description: {event.event_description}</p>
                        <div className="card-actions justify-end">
                            <button className="btn btn-primary">Sign Up</button>
                            <button className="btn btn-secondary" onClick={() => handleViewDetails(event.event_id)}>View Details</button>
                        </div>
                    </div>
                </div>
            ))}
            <button className="btn mb-3" onClick={() => handleViewUpcoming(1)}>View More Upcoming Events</button>
            
            <hr className="border-custom-dark  m-6"></hr>

            <h2 className="text-2xl font-bold mb-4">Top 3 Past Events</h2>
            {pastEvents.map(event => (
                <div key={event.event_id} className="card lg:card-side bg-green-900 shadow-xl mb-6">
                    <figure>
                        <img src="https://img.daisyui.com/images/stock/photo-1494232410401-ad00d5433cfa.jpg" alt="Event" />
                    </figure>
                    <div className="card-body text-white">
                        <h3 className="card-title">{event.event_title}</h3>
                        <p>Type: {event.eventType?.event_type_description}</p>
                        <p>Location: {event.eventLocation?.event_location_description}</p>
                        <p>Date: {formatDateTime(event.event_date, event.event_start_time, event.event_end_time)}</p>
                        <p>Description: {event.event_description}</p>
                        <div className="card-actions justify-end">
                            <button className="btn btn-secondary" onClick={() => handleViewDetails(event.event_id)}>View Details</button>
                        </div>
                    </div>
                </div>
            ))}
            <button className="btn mb-3" onClick={() => handleViewPast(1)}>View More Past Events</button>
        </div>
    );
}

export default EventsMain;
