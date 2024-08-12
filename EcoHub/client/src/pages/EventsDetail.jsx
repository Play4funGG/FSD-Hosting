import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { formatDateTime } from '../utils'; 
import http from '../http'; 
import '../App.css';

function EventsDetail() {
    const [event, setEvent] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { registered } = location.state || {};
    const [isUserRegistered, setIsUserRegistered] = useState(false);
    const [isEventEnded, setIsEventEnded] = useState(false);
    const [similarEvents, setSimilarEvents] = useState([]);

    useEffect(() => {
        const fetchSimilarEvents = async () => {
            try {
                const response = await http.get(`events/similar-events/${id}`);
                setSimilarEvents(response.data);
            } catch (error) {
                console.error('Error fetching similar events:', error);
            }
        };
    
        if (event) {
            fetchSimilarEvents();
        }
    }, [event]);
    
    useEffect(() => { // refresh the page when the page location changes
        window.scrollTo(0, 0);
    }, [location]);

    useEffect(() => {
        fetchEvent();
    }, [id]);

    const fetchEvent = async () => {
        try {
            const response = await http.get(`events/details/${id}`);
            setEvent(response.data);

            if (localStorage.getItem("accessToken")) {
                const userId = await getUserId();
                if (userId) {
                    const checkStatusResponse = await http.get(`/events/check-signup`, { params: { userId, eventId: id } });
                    setIsUserRegistered(checkStatusResponse.data.hasSignedUp);
                }
            }
        } catch (error) {
            console.error('Error fetching event details:', error);
        }
    };



    useEffect(() => {
        if (event) {
            // Assuming event_date and event_start_time are in "YYYY-MM-DD HH:mm" format
            const eventStartDate = new Date(`${event.event_date}T${event.event_start_time}`);
            const now = new Date();
    
            // Set the time of now to match the event's start time to accurately compare dates
            now.setHours(eventStartDate.getHours());
            now.setMinutes(eventStartDate.getMinutes());
    
            setIsEventEnded(now > eventStartDate);
        }
    }, [event]);
    

    const getUserId = async () => {
        try {
            const authResponse = await http.get('/user/auth');
            const userId = authResponse.data.user.id;
            console.log(userId); // For demonstration purposes
            return userId;
        } catch (error) {
            console.error('Error fetching authenticated user:', error);
            return null;
        }
    };

    const handleSignUpOrWithdraw = async () => {
        if (isEventEnded) {
            return;
        }
        let userId = null;
        if (localStorage.getItem("accessToken")) {
            userId = await getUserId();
            if (!userId) {
                throw new Error("Failed to retrieve user ID");
            }
        }

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
            const action = isUserRegistered ? 'withdraw' : 'signup';
            let response;
            if (action === 'withdraw') {
                // Confirm withdrawal action
                if (!window.confirm("Are you sure you want to withdraw from this event?")) {
                    return;
                }
                // Adjusting to use DELETE for withdrawal
                response = await http.delete(`/events/withdraw`, { params: { userId, eventId: id } });
            } else {
                // Confirm signup action
                if (!window.confirm("Are you sure you want to sign up for this event?")) {
                    return;
                }
                // Using POST for signup
                response = await http.post(`/events/signup`, { userId, eventId: id });
            }
            console.log(response.data);
            // Update the isUserRegistered state based on the response
            setIsUserRegistered(!response.data.hasSignedUp);
            // Display success message
            window.alert(`Successfully ${action === 'withdraw' ? 'withdrew' : 'signed up'} from the event.`);
            navigate(`/events/details/${id}`, { state: { registered: !isUserRegistered } });
            fetchEvent(); // Refresh the event details
        } catch (error) {
            console.error(`Error ${action}ing from event:`, error);
            window.alert(`Failed to ${action} from the event.`);
        }
    };
    
    const handleViewDetails = (eventId) => {
        navigate(`/events/details/${eventId}`);
    };

    if (!event) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto px-4">
            <section style={{ marginTop: '-80px', marginBottom:'10px'}}>
                {/* Full-width banner image */}
                <div className="relative h-96">
                    <img 
                        src={event.imageFile ? `${import.meta.env.VITE_FILE_BASE_URL}/${event.imageFile}` : 'https://via.placeholder.com/1200x400'} 
                        alt="Event Banner" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1/2 left-4 transform -translate-y-1/2 max-w-s whitespace-normal overflow-hidden h-24">
                        <h1 className="text-4xl font-bold text-white bg-black bg-opacity-25 rounded text-shadow-lg p-3">Event Title: {event.event_title}</h1>
                    </div>
                    <h1 className="absolute top-60 left-4 text-2xl font-bold text-white bg-black bg-opacity-25 rounded text-shadow-lg p-3">Organised by Yio Chu Kang CC</h1>
                </div>
            </section>


                <div className="breadcrumbs text-2xl md-6 mx-auto px-4 py-8">
                    <ul>
                        <li><button onClick={() => navigate('/')}>Home</button></li> 
                        <li><button onClick={() => navigate('/events')}>Events Page</button></li> 
                        <li>Events Details</li>
                    </ul>
                </div>

                <div className="card lg:card-side bg-green-900 shadow-xl mb-6 border-primary">
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
                        <button 
                        className={`btn ${isEventEnded ? 'disabled' : (isUserRegistered ? '--secondary-main' : '--primary-main')}`} 
                        onClick={isEventEnded ? undefined : handleSignUpOrWithdraw}
                        disabled={isEventEnded}
                        style={{
                            opacity: isEventEnded ? 0.7 : 1, // Adjust opacity for disabled state
                            color: isEventEnded ? 'gray' : 'white',
                            cursor: isEventEnded ? 'not-allowed' : 'pointer',
                        }}
                        >
                            {isEventEnded ? 'Event Ended' : (isUserRegistered ? 'Withdraw' : 'Sign Up')}
                        </button>
                    </div>
                </div>
                
                {/* Event details */}   
                <div>
                    <h2 className="text-3xl underline"><strong>Event Details</strong></h2>
                    <h3 className='text-xl pt-2'><strong>Event Name:</strong> {event.event_title}</h3>
                    {/* temporary text */}
                    <p>Lorem ipsum odor amet, consectetuer adipiscing elit. Facilisis mollis taciti orci inceptos nostra pulvinar. Hac a etiam feugiat finibus ad inceptos habitasse nam. Dictumst congue eros tellus blandit; risus non. Vitae mauris mus scelerisque sodales primis pharetra quisque nam curabitur. Malesuada porta fames commodo parturient nulla. Senectus ut parturient malesuada; fames sollicitudin habitant.</p>
                    <p>Dignissim commodo mi ex volutpat cursus. Euismod bibendum turpis orci pharetra eros; lacus vitae placerat? Posuere duis massa semper quam ornare. Egestas senectus purus rhoncus platea maximus. Per morbi hendrerit lobortis netus dis. Est bibendum malesuada; vivamus justo ullamcorper purus hac. Scelerisque taciti platea at venenatis non bibendum neque mauris. Non habitant congue felis laoreet mus donec porttitor nisi ligula.</p>
                    <p>Taciti morbi volutpat turpis nulla semper nunc suscipit, sed porta. Tristique orci tempor enim a cras morbi vestibulum. Lobortis suscipit mattis mauris taciti lorem non tempor justo. Litora fringilla cras libero sed ipsum feugiat pharetra dapibus elementum. Ornare non mus lectus scelerisque finibus ante mattis tortor. Ultrices donec donec arcu consequat elit dolor quis ad. Curae molestie dui at blandit ultrices nisl feugiat nullam feugiat. Malesuada urna netus consequat cras posuere vehicula vehicula? Finibus class habitasse, dolor vitae felis metus.</p>
                    <p>Sociosqu interdum donec duis eu torquent morbi rhoncus proin. Venenatis dolor turpis viverra nascetur scelerisque facilisis. Dolor adipiscing sodales nascetur interdum egestas turpis. Laoreet magna cursus quam cubilia bibendum donec leo pellentesque risus. Volutpat proin duis mauris aliquam litora id. Pulvinar accumsan nostra purus, suscipit consequat ipsum conubia accumsan. Sociosqu montes duis nascetur tempus magna ornare nisl augue? Orci rhoncus lacus purus ultricies habitant vitae consectetur.</p>
                    <p>Et et egestas fermentum tortor cubilia pretium. Tortor eros odio taciti commodo erat magnis quisque tincidunt faucibus. Nascetur ultricies lacinia sollicitudin semper facilisi. Ultrices malesuada suspendisse donec habitant congue curabitur. Euismod leo velit aptent est dis orci dis sodales. Turpis viverra curae faucibus; orci nascetur ac risus ut. Augue ante placerat neque magnis erat posuere sagittis dapibus semper.</p>
                </div>
                <div>
                    <h2 className="text-3xl underline"><strong>Event Location</strong></h2>
                    <h3 className='text-xl pt-2'><strong>Location:</strong> {event.eventLocation?.event_location_description}</h3>
                    <br/>
                    <p><strong className='text-2xl underline'>Organising Committee:</strong></p>
                    <p className='text-xl'> Yio Chu Kang CC</p>
                    <p className='text-xl'><strong>Contact:</strong> 6457 0414</p>
                    <p className='text-xl'><strong>Operating Hours:</strong> 10am - 6pm, Mon-Sun</p>
                    <p className='text-xl'><strong>Address:</strong> 633 Ang Mo Kio Ave 6, #01-5135 8, Singapore 560633</p>
                    <div style={{ width: '100%' }}>
                        <iframe 
                            width="100%"
                            height="400"
                            frameBorder="0"
                            scrolling="no"
                            marginHeight="0"
                            marginWidth="0"
                            src="https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=en&amp;q=633%20Ang%20Mo%20Kio%20Ave%206,%20Singapore%20560633+(Yio%20Chu%20Kang%20Community%20Club)&amp;t=&amp;z=18&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
                        >
                            <a href="https://www.gps.ie/" target="_blank" rel="noopener noreferrer">gps tracker sport</a>
                        </iframe>
                    </div>



                </div>

                {/* Similar events code */}
                <h2 className='text-3xl underline mt-10'><strong>Other Similar Events</strong></h2>
                <div className="mt-4 p2 flex justify-around flex-wrap ">
                    {similarEvents.map((event) => (
                        <div key={event.event_id} className="card bg-green-900 w-full max-w-md shadow-xl m-2 text-white">
                            <figure>
                                <img 
                                    src={event.imageFile ? `${import.meta.env.VITE_FILE_BASE_URL}/${event.imageFile}` : 'https://via.placeholder.com/400'} 
                                    alt="Event" 
                                    style={{ maxWidth: '450px', maxHeight: '250px', width: '450px', height: '250px', objectFit: 'cover' }}
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/250'; }} 
                                />
                            </figure>
                            <div className="card-body">
                                <h2 className="card-title">{event.event_title}</h2>
                                <p>Date: {formatDateTime(event.event_date, event.event_start_time, event.event_end_time)}</p>
                                <p>Category: {event.eventCategory?.event_cat_description}</p>
                                <p>Location: {event.eventLocation?.event_location_description}</p>
                                <div className="card-actions justify-end">
                                    <button className="btn --primary-main" onClick={() => handleViewDetails(event.event_id)}>More Info</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        
    );
}

export default EventsDetail;
