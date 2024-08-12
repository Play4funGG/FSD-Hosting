import http from '../http';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import { Box, Typography, TextField, Button, List, ListItem, ListItemIcon, ListItemText, Avatar } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import EventCarousel from './EventCarousel';
import EventCategoryCarousel from './EventCategoryCarousel';
import PageFooter from './PageFooter';

function UserHome (){
    
    const [temporaryfiller, setuplistitems] = useState([]);
    const [selectedevents, setuptargetevents] = useState([]);

    useEffect(() => {
            http.get('/events/categories')
            .then(res => {

                const categories = res.data;
                
                setuplistitems(categories);
                
            })
        .catch(error => console.error('Error fetching event categories:', error));
        
        http.get('/events')
        .then(res => {

            const events = res.data.upcomingEvents;
            
            setuptargetevents(events);
            
        })
    .catch(error => console.error('Error fetching events:', error));
        }
    )

    

    return (
        <div>
            
            <EventCarousel />

            <EventCategoryCarousel />

            <div class="w-full h-screen bg-gray-400 flex flex-col justify-center items-start rounded-box">
            <div >
                    <h3>Browsing Events in: Singapore</h3>
                    <ul class ="flex flex-row">
                        {temporaryfiller.map(listitems =>(
                            <li key={listitems.event_cat_id}>
                                <button className="btn btn-active btn-accent"> {listitems.event_cat_description} </button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div class = "flex flex-wrap justify-center gap-4">
                {selectedevents.map(event =>(
                    <div key={event.event_id} className="card bg-white w-64 shadow-xl m-2">
                    <figure>
                    <img
                        src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
                        alt="Shoes"
                    />
                    </figure>
                    <div className="card-body">
                    <h2 className="card-title">{event.event_title}</h2>
                    <p className="text-sm">If a dog chews shoes whose shoes does he choose?</p>
                    <div className="card-actions justify-end">
                        <button className="btn btn-primary">Buy Now</button>
                    </div>
                    </div>
                </div>
                ))}
                </div>                

            </div>

            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography variant="h5" sx={{ mb: 4 }}>
                    Welcome to your EcoHub account!                </Typography>
                <ToastContainer />

            </Box>


        </div>
    );
};

export default UserHome;