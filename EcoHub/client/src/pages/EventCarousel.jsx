import http from '../http';
import React, { useState, useEffect } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Link, useNavigate } from 'react-router-dom';


function EventCarousel (){

    const [carouselevents, setupcarouselevents] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        http.get('/events')
           .then(res => {

                const upcoming = res.data.upcomingEvents;
                
                setupcarouselevents(upcoming);
                
            })
           .catch(error => console.error('Error fetching events:', error));
    }, []);

    const handleViewDetails = (eventId) => {
        navigate(`/events/details/${eventId}`);
    };

    return(
        <Carousel autoPlay interval={3000} infiniteLoop showThumbs={false}>
        {carouselevents.map(event => (
                    <div key={event.event_id} className={`carousel-item relative w-full`} onClick={() => handleViewDetails(event.event_id)}>
                    <img
                        src="https://img.daisyui.com/images/stock/photo-1625726411847-8cbb60cc71e6.webp"
                        className="w-full" />
                        <div className="absolute left-0 top-0 h-full w-1/2 bg-black opacity-50 flex flex-col items-center justify-center text-center p-4">
                        <div className="text-white mb-2">{event.event_id}</div>
                        <div className="text-white mb-2">{event.event_title}</div>
                        <div className="text-white mb-2">{event.event_description}</div>
                        <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300" onClick={() => handleViewDetails(event.event_id)}>
                                View Details
                        </button>
                        </div>
                    </div>
        ))}
      </Carousel>
    );
};

export default EventCarousel;