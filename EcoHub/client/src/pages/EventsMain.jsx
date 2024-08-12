import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDateTime } from '../utils';
import http from '../http';
import '../App.css';

function EventsMain() {
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [pastEvents, setPastEvents] = useState([]);
    const [userId, setUserId] = useState(null);
    const [signUpStatuses, setSignUpStatuses] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        http.get('/events').then(res => {
            const now = new Date();
            const upcoming = res.data.upcomingEvents;
            const past = res.data.pastEvents;
            setUpcomingEvents(upcoming);
            setPastEvents(past);
        }).catch(error => console.error('Error fetching events:', error));
    }, []);

    useEffect(() => {
        if (localStorage.getItem("accessToken")) {
            getUserId();
        }
    }, []);

    useEffect(() => {
        if (userId && upcomingEvents.length > 0 && pastEvents.length > 0) {
            checkAllSignUpStatuses();
        }
    }, [userId, upcomingEvents, pastEvents]);

    const checkAllSignUpStatuses = async () => {
        const promises = [...upcomingEvents, ...pastEvents].map(async (event) => {
            const hasSignedUp = await checkSignUpStatus(event.event_id);
            return { [event.event_id]: hasSignedUp };
        });

        const statuses = await Promise.all(promises);
        setSignUpStatuses(Object.assign({}, ...statuses));
    };

    const checkSignUpStatus = async (eventId) => {
        try {
            const signUpCheckResponse = await http.get(`/events/check-signup`, { params: { userId, eventId } });
            console.log(`Signup status for eventId ${eventId}:`, signUpCheckResponse.data.hasSignedUp);
            return signUpCheckResponse.data.hasSignedUp;
        } catch (error) {
            console.error('Error checking signup status:', error);
            return false;
        }
    };

    const getUserId = async () => {
        try {
            const authResponse = await http.get('/user/auth');
            const id = authResponse.data.user.id;
            setUserId(id);
        } catch (error) {
            console.error('Error fetching authenticated user:', error);
            setUserId(null);
        }
    };

    const handleWithdraw = async (eventId) => {
        if (!userId) {
            window.alert("Please login or register to withdraw for an event.");
            if (window.confirm("Do you have an account?\nClick 'OK' to login or 'Cancel' to register.")) {
                navigate('/login');
            } else {
                navigate('/register');
            }
            return;
        }

        try {
            if (!window.confirm("Are you sure you want to withdraw from this event?")) {
                return;
            }
            const withdrawResponse = await http.delete(`/events/withdraw`, { params: { userId, eventId } });
            console.log(withdrawResponse.data);
            window.alert("Successfully withdrew from the event.");
            navigate(`/events/details/${eventId}`, { state: { registered: false } });
        } catch (error) {
            console.error('Error withdrawing from event:', error);
            window.alert("Failed to withdraw from the event.");
        }
    };

    const handleSignUp = async (eventId) => {
        if (!userId) {
            window.alert("Please login or register to sign up for an event.");
            if (window.confirm("Do you have an account?\nClick 'OK' to login or 'Cancel' to register.")) {
                navigate('/login');
            } else {
                navigate('/register');
            }
            return;
        }

        try {
            if (!window.confirm("Are you sure you want to sign up for this event?")) {
                return;
            }
            const signUpResponse = await http.post(`/events/signup`, { userId, eventId });
            console.log(signUpResponse.data);
            window.alert("Successfully signed up for the event.");
            navigate(`/events/details/${eventId}`, { state: { registered: true } });
        } catch (error) {
            console.error('Error signing up for event:', error);
            window.alert("Failed to sign up for the event.");
        }
    };

    const handleViewDetails = (eventId) => {
        navigate(`/events/details/${eventId}`);
    };

    const handleViewUpcoming = (pageNoUp) => {
        navigate(`/events/upcoming/${pageNoUp}`);
    };

    const handleViewPast = (pageNoPast) => {
        navigate(`/events/past/${pageNoPast}`);
    };

    const handleViewAllEvents = (pageNoS) => {
        navigate(`/events/sorting/${pageNoS}`);
    };

    return (
        <div className="container mx-auto px-4">
            
            <div className="breadcrumbs text-2xl md-6">
                <ul>
                    <li><button onClick={() => navigate('/')}>Home</button></li> 
                    <li>Events Page</li> 
                </ul>
            </div>
            <button className="btn mb-3 customButton" onClick={() => handleViewAllEvents(1)}>View All Events</button>

            <h2 className="text-2xl font-bold mb-4">Top 3 Upcoming Events</h2>
            {upcomingEvents.length > 0 ? (
                upcomingEvents.map(event => (
                    <div key={event.event_id} className="card lg:card-side bg-green-900 shadow-xl mb-6">
                    <figure>
                        <img 
                            src={event.imageFile ? `${import.meta.env.VITE_FILE_BASE_URL}/${event.imageFile}` : 'https://via.placeholder.com/400'} 
                            alt="Event" 
                            style={{ maxWidth: '400px', maxHeight: '400px', width: '400px', height: '400px', objectFit: 'cover' }}
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150'; }} 
                        />
                    </figure>
                    <div className="card-body text-white">
                        <h3 className="card-title">{event.event_title}</h3>
                        <p>Type: {event.eventType?.event_type_description}</p>
                        <p>Category: {event.eventCategory?.event_cat_description}</p>
                        <p>Location: {event.eventLocation?.event_location_description}</p>
                        <p>Date: {formatDateTime(event.event_date, event.event_start_time, event.event_end_time)}</p>
                        <p>Description: {event.event_description}</p>
                        <div className="card-actions justify-end">
                            {signUpStatuses[event.event_id] ? (
                                <button className="btn --secondary-main" onClick={() => handleWithdraw(event.event_id)}>Click to Withdraw</button>
                            ) : (
                                <button className="btn btn-primary" onClick={() => handleSignUp(event.event_id)}>Sign Up</button>
                            )}
                            <button className="btn --primary-main" onClick={() => handleViewDetails(event.event_id)}>View Details</button>
                        </div>
                    </div>
                </div>
                ))
            ) : (
                <p>No upcoming events</p>
            )}
            <button className="btn mb-3 customButton" onClick={() => handleViewUpcoming(1)}>View More Upcoming Events</button>
            
            <hr className="border-custom-dark m-6"></hr>

            <h2 className="text-2xl font-bold mb-4">Top 3 Recent Past Events</h2>
            {pastEvents.length > 0? (
                pastEvents.map(event => (
                <div key={event.event_id} className="card lg:card-side bg-green-900 shadow-xl mb-6 border-dark">
                    <figure>
                        <img 
                            src={event.imageFile ? `${import.meta.env.VITE_FILE_BASE_URL}/${event.imageFile}` : 'https://via.placeholder.com/400'} 
                            alt="Event" 
                            style={{ maxWidth: '400px', maxHeight: '400px', width: '400px', height: '400px', objectFit: 'cover' }}
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150'; }} 
                        />
                    </figure>
                    <div className="card-body text-white">
                        <h3 className="card-title">{event.event_title}</h3>
                        <p>Type: {event.eventType?.event_type_description}</p>
                        <p>Category: {event.eventCategory?.event_cat_description}</p>
                        <p>Location: {event.eventLocation?.event_location_description}</p>
                        <p>Date: {formatDateTime(event.event_date, event.event_start_time, event.event_end_time)}</p>
                        <p>Description: {event.event_description}</p>
                        <div className="card-actions justify-end">
                            <button className="btn --primary-main" onClick={() => handleViewDetails(event.event_id)}>View Details</button>
                        </div>
                    </div>
                </div>
                ))
            ) : (
                <p>No upcoming events</p>
            )}
            <button className="btn mb-3 customButton" onClick={() => handleViewPast(1)}>View More Past Events</button>
        </div>
    );
}

export default EventsMain;
