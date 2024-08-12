import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { formatDateTime } from '../utils';
import http from '../http';

function EventsSorting() {
    const [events, setEvents] = useState([]);
    const [types, setType] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(null);
    const [search, setSearch] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const pageSize = 10; // Number of items per page
    const [userId, setUserId] = useState(null); // Added to track the current user

    useEffect(() => {
        fetchCategories();
        fetchTypes();
        fetchEvents(currentPage, search, selectedCategory, selectedType);
    }, [currentPage, search, selectedCategory, selectedType]);

    useEffect(() => { // refresh the page when the page location changes
        window.scrollTo(0, 0);
    }, [location]);

    useEffect(() => {
        if (localStorage.getItem("accessToken")) {
            getUserId();
        }
    }, []);

    useEffect(() => {
        if (userId) {
            checkAllSignUpStatuses();
        }
    }, [userId]);

    const fetchCategories = async () => {
        try {
            const response = await http.get(`events/categories`);
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchTypes = async () => {
        try {
            const response = await http.get(`events/type`);
            setType(response.data);
        } catch (error) {
            console.error('Error fetching types:', error);
        }
    };

    const fetchEvents = async (pageNo, searchQuery, category, type) => {
        try {
            const response = await http.get(`events/sorting/${pageNo}`, {
                params: { search: searchQuery, category: category, type: type}
            });
            const { events, currentPage, totalPages } = response.data;
            const now = new Date();
            const updatedEvents = await Promise.all(events.map(async (event) => {
                const eventDate = new Date(event.event_date, event.event_start_time);
                const isFuture = eventDate > now;
                const hasSignedUp = await checkSignUpStatus(event.event_id); // Call the API to check sign-up status
                return {
                   ...event,
                    isFuture,
                    hasSignedUp
                };
            }));
            setEvents(updatedEvents);
            setCurrentPage(currentPage);
            setTotalPages(totalPages);
        } catch (error) {
            console.error('Error fetching events:', error);
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

    const checkAllSignUpStatuses = async () => {
        const promises = events.map(async (event) => {
            const hasSignedUp = await checkSignUpStatus(event.event_id);
            return { [event.event_id]: hasSignedUp };
        });

        const statuses = await Promise.all(promises);
        setSignUpStatuses(Object.assign({},...statuses));
    };

    const checkSignUpStatus = async (eventId) => {
        try {
            const signUpCheckResponse = await http.get(`/events/check-signup`, { params: { userId, eventId } });
            return signUpCheckResponse.data.hasSignedUp;
        } catch (error) {
            console.error('Error checking signup status:', error);
            return false;
        }
    };

    const handleSignUp = async (eventId) => {
        if (!userId) {
            window.alert("Please login or register to sign up for an event.");
            navigate('/login');
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

    const handleWithdraw = async (eventId) => {
        if (!userId) {
            window.alert("Please login or register to withdraw from an event.");
            navigate('/login');
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

    const handleViewDetails = (eventId) => {
        navigate(`/events/details/${eventId}`);
    };

    const handlePageChange = (pageNo) => {
        setCurrentPage(pageNo);
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            fetchEvents(1, search, selectedCategory, selectedType);
        }
    };

    const handleSearchClick = () => {
        fetchEvents(1, search, selectedCategory, selectedType);
    };

    const handleClearSearch = () => {
        setSearch(''); // Reset search box
        setSelectedCategory(''); // Reset category filter to default
        setSelectedType(''); // Reset type filter to default
        fetchEvents(1, '', '', ''); // Fetch events without any filters
    };

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
        fetchEvents(1, search, e.target.value, selectedType); //to allow both category and type to be selected
    };

    const handleTypeChange = (e) => {
        setSelectedType(e.target.value);
        fetchEvents(1, search, selectedCategory, e.target.value); //to allow both category and type to be selected
    };

    // Calculate the range of events being shown
    const startEvent = (currentPage - 1) * pageSize + 1;
    const endEvent = Math.min(currentPage * pageSize, startEvent + events.length - 1);

    return (
    <div className="container mx-auto px-4">
        <div className="breadcrumbs text-2xl md-6">
            <ul>
                <li><button onClick={() => navigate('/')}>Home</button></li> 
                <li><button onClick={() => navigate('/events')}>Events Page</button></li> 
                <li>All Events</li> 
            </ul>
        </div>
        <h2 className="text-2xl font-bold mb-4">All Events</h2>

        <div className="mb-4 flex">
            <input
                type="text"
                value={search}
                placeholder="Search events"
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                className="input input-bordered w-full max-w-xs text-white bg-green-800"
            />
            
            <select onChange={handleCategoryChange} className="select select-bordered bg-green-800 ml-2 text-white" value={selectedCategory}>
                <option value="">All Categories</option>
                {categories.map(category => (
                    <option key={category.event_cat_id} value={category.event_cat_id}>
                        {category.event_cat_description}
                    </option>
                ))}
            </select>
            <select onChange={handleTypeChange} className="select select-bordered bg-green-800 ml-2 text-white" value={selectedType}>
                <option value="">All Types</option>
                {types.map(type => (
                    <option key={type.event_type_id} value={type.event_type_id}>
                        {type.event_type_description}
                    </option>
                ))}
            </select>
            <button onClick={handleClearSearch} className="btn customButton ml-2">
                Clear Selected Filters
            </button>
        </div>

        <div className="mb-4">
            <p>Page {currentPage} of {totalPages}</p>
            <p>Showing {startEvent}-{endEvent} events</p>
        </div>

        {events.length > 0 ? (
            events.map(event => (
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
                            {event.isFuture && !event.hasSignedUp && (
                                <button className="btn --primary-main" onClick={() => handleSignUp(event.event_id)}>Sign Up</button>
                            )}
                            {event.isFuture && event.hasSignedUp && (
                                <button className="btn --secondary-main" onClick={() => handleWithdraw(event.event_id)}>Withdraw</button>
                            )}
                            {!event.isFuture && (
                                <button className="btn --primary-main" onClick={() => handleViewDetails(event.event_id)}>View Details</button>
                            )}
                        </div>
                    </div>
                </div>
            ))
        ) : (
            <p>No events found</p>
        )}

        <div className="pagination">
            {[...Array(totalPages)].map((_, index) => (
                <button
                    key={index}
                    className={`join-item btn ${currentPage === index + 1? 'btn-active' : ''}`}
                    onClick={() => handlePageChange(index + 1)}
                >
                    {index + 1}
                </button>
            ))}
        </div>
    </div>
);

}

export default EventsSorting;
