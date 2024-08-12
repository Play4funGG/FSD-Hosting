import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextField, Button, MenuItem, Box } from '@mui/material';
import http from '../http';
import 'tailwindcss/tailwind.css';
import 'daisyui';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function UpdateEventOrganiser() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [eventData, setEventData] = useState({
        event_cat_id: '',
        event_type_id: '',
        event_location_id: '',
        event_title: '',
        event_description: '',
        event_date: '',
        event_start_time: '',
        event_end_time: '',
        event_status_id: 3,
        reward_id: '',
        signup_limit: '',
    });
    const [loading, setLoading] = useState(true);
    const [imageFile, setImageFile] = useState(null);
    const [selectedImage, setSelectedImage] = useState('');
    const [rewards, setRewards] = useState([]);

    useEffect(() => {
        // Fetch event data
        http.get(`/organiser/event/${eventId}`)
            .then(res => {
                const data = res.data;
                console.log('Event data fetched:', data); // Log the fetched data
                setEventData({
                    event_cat_id: data.event_cat_id?.toString() || '',
                    event_type_id: data.event_type_id?.toString() || '',
                    event_location_id: data.event_location_id?.toString() || '',
                    reward_id: data.reward_id || '',
                    event_title: data.event_title || '',
                    event_description: data.event_description || '',
                    event_date: data.event_date ? data.event_date.split('T')[0] : '',
                    event_start_time: data.event_start_time || '',
                    event_end_time: data.event_end_time || '',
                    event_status_id: data.event_status_id?.toString() || '3',
                    signup_limit: data.signup_limit || '',
                });
                if (data.imageFile) {
                    setImageFile(data.imageFile);
                    setSelectedImage(`${import.meta.env.VITE_FILE_BASE_URL}${data.imageFile}`);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching event:', error);
                setLoading(false);
            });

        // Fetch rewards
        http.get('/rewards')
            .then(res => {
                const rewardsData = res.data.currentrewards || [];
                setRewards(rewardsData);
            })
            .catch(error => {
                console.error('Error fetching rewards:', error);
            });
    }, [eventId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEventData(prevEventData => ({
            ...prevEventData,
            [name]: value,
        }));
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 1024 * 1024) { // 1MB limit
                toast.error('Maximum file size is 1MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result);
            };
            reader.readAsDataURL(file);

            let formData = new FormData();
            formData.append('file', file);

            http.post('/file/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
                .then((res) => {
                    toast.success('Image uploaded successfully!');
                    setImageFile(res.data.filename || res.data.filePath);
                })
                .catch((error) => {
                    toast.error('Failed to upload image.');
                    console.log('Upload Error:', error.response ? error.response.data : error.message);
                });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Prepare final event data
        const finalEventData = { ...eventData };
    
        // Handle reward_id to be null if no reward is selected
        if (finalEventData.reward_id === '') {
            finalEventData.reward_id = null; // Set to null if no reward is selected
        } else {
            finalEventData.reward_id = Number(finalEventData.reward_id);
        }
        
        // Create FormData object
        const formData = new FormData();
        for (const key in finalEventData) {
            if (finalEventData[key] !== undefined && finalEventData[key] !== null) {
                formData.append(key, finalEventData[key]);
            }
        }
        if (imageFile) {
            formData.append('imageFile', imageFile);
        }
        
        // Send PUT request to update event
        http.put(`/organiser/event/${eventId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
            .then(() => {
                toast.success('Event updated successfully!');
                navigate('/organiser/event');
            })
            .catch(error => {
                console.error('Error updating event:', error.response ? error.response.data : error.message);
                toast.error('Error updating event.');
            });
    };

    const handleDelete = () => {
        http.delete(`/organiser/event/${eventId}`)
            .then(() => {
                toast.success('Event deleted successfully!');
                navigate('/organiser/event');
            })
            .catch(error => {
                console.error('Error deleting event:', error.response ? error.response.data : error.message);
                toast.error('Error deleting event.');
            });
    };

    const handleCancel = () => {
        navigate('/organiser/event');
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto mt-8 p-4 bg-white shadow-md rounded-lg">
            <h1 className="text-4xl font-bold mb-6">Update Event</h1>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <TextField
                        select
                        label="Event Category"
                        name="event_cat_id"
                        value={eventData.event_cat_id}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    >
                        <MenuItem value="">Select category</MenuItem>
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
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    >
                        <MenuItem value="">Select type</MenuItem>
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
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    >
                        <MenuItem value="">Select location</MenuItem>
                        <MenuItem value="1">Community Hall A</MenuItem>
                        <MenuItem value="2">Outdoor Park</MenuItem>
                        <MenuItem value="3">Conference Room B</MenuItem>
                        <MenuItem value="4">Auditorium C</MenuItem>
                        <MenuItem value="5">Online</MenuItem>
                    </TextField>
                    <TextField
                        select
                        label="Reward"
                        name="reward_id"
                        value={eventData.reward_id}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    >
                        <MenuItem value='null'>Select reward</MenuItem>
                        {rewards.map((reward) => (
                            <MenuItem key={reward.reward_id} value={reward.reward_id}>
                                {reward.reward_name}
                            </MenuItem>
                        ))}
                    </TextField>
                    {eventData.event_location_id !== '5' && ( // Only show signup_limit if location is not 'Online'
                        <TextField
                            label="Signup Limit"
                            name="signup_limit"
                            value={eventData.signup_limit}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            type="number"
                            inputProps={{ min: 0 }} // Ensure positive numbers
                        />
                    )}
                    <TextField
                        label="Event Title"
                        name="event_title"
                        value={eventData.event_title}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Event Description"
                        name="event_description"
                        value={eventData.event_description}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        multiline
                        rows={4}
                    />
                    <TextField
                        label="Event Date"
                        name="event_date"
                        type="date"
                        value={eventData.event_date}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <TextField
                        label="Event Start Time"
                        name="event_start_time"
                        value={eventData.event_start_time}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        type="time"
                    />
                    <TextField
                        label="Event End Time"
                        name="event_end_time"
                        value={eventData.event_end_time}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        type="time"
                    />
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-6">Upload Event Image</h2>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 mb-4"
                    />
                    {selectedImage && (
                        <Box className="mt-4">
                            <img src={selectedImage} alt="Event" className="max-w-full h-auto rounded-lg shadow-md" />
                        </Box>
                    )}
                    <div className="flex justify-between mt-6">
                        <Button type="submit" variant="contained" color="primary">
                            Update Event
                        </Button>
                        <Button type="button" variant="contained" color="secondary" onClick={handleDelete}>
                            Delete Event
                        </Button>
                        <Button type="button" variant="contained" color="info" onClick={handleCancel}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </form>
            <ToastContainer />
        </div>
    );
}

export default UpdateEventOrganiser;
