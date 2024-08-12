import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextField, Button, MenuItem, Box } from '@mui/material';
import http from '../http';
import 'tailwindcss/tailwind.css';
import 'daisyui';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ViewProposalOrganiser() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [eventData, setEventData] = useState({
        event_cat_id: '',
        event_type_id: '',
        event_location_id: '',
        reward_id: '',
        event_title: '',
        event_description: '',
        event_date: '',
        event_start_time: '',
        event_end_time: '',
        signup_limit: '', // Added signup_limit
        event_status_id: ''
    });
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState('');
    const [rewards, setRewards] = useState([]); // State to hold rewards

    useEffect(() => {
        // Fetch the event data
        http.get(`/organiser/proposal/${eventId}`)
            .then(res => {
                const data = res.data;
                setEventData({
                    event_cat_id: data.event_cat_id.toString(),
                    event_type_id: data.event_type_id.toString(),
                    event_location_id: data.event_location_id.toString(),
                    reward_id: data.reward_id.toString(),
                    event_title: data.event_title,
                    event_description: data.event_description,
                    event_date: data.event_date.split('T')[0],
                    event_start_time: data.event_start_time,
                    event_end_time: data.event_end_time,
                    signup_limit: data.signup_limit || '', // Fetch signup_limit
                    event_status_id: data.event_status_id.toString()
                });

                // Set selected image
                if (data.imageFile) {
                    setSelectedImage(`${import.meta.env.VITE_FILE_BASE_URL}${data.imageFile}`);
                }

                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching event:', error);
                setLoading(false);
                toast.error('Error fetching event.');
            });

        // Fetch the rewards data
        http.get('/rewards')
            .then(res => {
                setRewards(res.data.currentrewards);
            })
            .catch(error => {
                console.error('Error fetching rewards:', error);
            });
    }, [eventId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    // Find the reward name from rewards data
    const rewardName = rewards.find(reward => {
        return reward.reward_id.toString() === eventData.reward_id.toString();
    })?.reward_name || 'No Reward';

    return (
        <div className="container mx-auto mt-8 p-4 bg-white shadow-md rounded-lg">
            <h1 className="text-4xl font-bold mb-6">View Proposal</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <form>
                        <TextField
                            select
                            label="Event Category"
                            name="event_cat_id"
                            value={eventData.event_cat_id}
                            fullWidth
                            margin="normal"
                            InputProps={{
                                readOnly: true,
                                disabled: true
                            }}
                        >
                            <MenuItem value="1">Education</MenuItem>
                            <MenuItem value="2">Recreation</MenuItem>
                            <MenuItem value="3">Cultural</MenuItem>
                            <MenuItem value="4">Social</MenuItem>
                        </TextField>
                        <TextField
                            select
                            label="Event Type"
                            name="event_type_id"
                            value={eventData.event_type_id}
                            fullWidth
                            margin="normal"
                            InputProps={{
                                readOnly: true,
                                disabled: true
                            }}
                        >
                            <MenuItem value="1">Workshop</MenuItem>
                            <MenuItem value="2">Seminar</MenuItem>
                            <MenuItem value="3">Festival</MenuItem>
                            <MenuItem value="4">Community Gathering</MenuItem>
                        </TextField>
                        <TextField
                            select
                            label="Event Location"
                            name="event_location_id"
                            value={eventData.event_location_id}
                            fullWidth
                            margin="normal"
                            InputProps={{
                                readOnly: true,
                                disabled: true
                            }}
                        >
                            <MenuItem value="1">Community Hall A</MenuItem>
                            <MenuItem value="2">Outdoor Park</MenuItem>
                            <MenuItem value="3">Conference Room B</MenuItem>
                            <MenuItem value="4">Auditorium C</MenuItem>
                            <MenuItem value="5">Online</MenuItem>
                        </TextField>
                        <TextField
                            label="Reward"
                            name="reward_id"
                            value={rewardName} // Show reward name
                            fullWidth
                            margin="normal"
                            InputProps={{
                                readOnly: true,
                                disabled: true
                            }}
                        />
                        <TextField
                            label="Event Title"
                            name="event_title"
                            value={eventData.event_title}
                            fullWidth
                            margin="normal"
                            InputProps={{
                                readOnly: true,
                                disabled: true
                            }}
                        />
                        <TextField
                            label="Event Description"
                            name="event_description"
                            value={eventData.event_description}
                            fullWidth
                            margin="normal"
                            multiline
                            rows={4}
                            InputProps={{
                                readOnly: true,
                                disabled: true
                            }}
                        />
                        <TextField
                            label="Event Date"
                            name="event_date"
                            type="date"
                            value={eventData.event_date}
                            fullWidth
                            margin="normal"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            InputProps={{
                                readOnly: true,
                                disabled: true
                            }}
                        />
                        <TextField
                            label="Event Start Time"
                            name="event_start_time"
                            value={eventData.event_start_time}
                            fullWidth
                            margin="normal"
                            type="time"
                            InputProps={{
                                readOnly: true,
                                disabled: true
                            }}
                        />
                        <TextField
                            label="Event End Time"
                            name="event_end_time"
                            value={eventData.event_end_time}
                            fullWidth
                            margin="normal"
                            type="time"
                            InputProps={{
                                readOnly: true,
                                disabled: true
                            }}
                        />
                        <TextField
                            label="Signup Limit"
                            name="signup_limit"
                            value={eventData.signup_limit}
                            fullWidth
                            margin="normal"
                            InputProps={{
                                readOnly: true,
                                disabled: true
                            }}
                        />
                        <div className="flex justify-between mt-4">
                            <Button
                                type="button"
                                variant="contained"
                                color="primary"
                                className="bg-blue-500 text-white hover:bg-blue-600"
                                onClick={() => navigate(-1)} // Go back to the previous page
                            >
                                Back
                            </Button>
                        </div>
                    </form>
                </div>
                <div>
                    {selectedImage && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Event Image</h2>
                            <Box className="max-w-full h-auto">
                                <img src={selectedImage} alt="Event" className="w-full h-auto rounded-lg shadow-md" />
                            </Box>
                        </div>
                    )}
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

export default ViewProposalOrganiser;
