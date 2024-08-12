import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import http from '../http';

// Utility function to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

// Character counter component
const CharacterCounter = ({ text, maxLength }) => {
    const [count, setCount] = useState(text.length);

    useEffect(() => {
        setCount(text.length);
    }, [text]);

    return (
        <div className={`text-sm ${count > maxLength ? 'text-red-500' : ''}`}>
            {count}/{maxLength}
        </div>
    );
};

function AddEvent() {
    const navigate = useNavigate();
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imageError, setImageError] = useState('');
    const [rewards, setRewards] = useState([]);
    const [eventLocation, setEventLocation] = useState('');
    const [eventDate, setEventDate] = useState(new Date(getTodayDate()));

    useEffect(() => {
        // Fetch rewards from the endpoint
        const fetchData = async () => {
            try {
                const rewardsRes = await http.get('/rewards');
                setRewards(rewardsRes.data.currentrewards); // Access the 'currentrewards' array
            } catch (error) {
                toast.error('Failed to fetch rewards.');
                console.error(error);
            }
        };

        fetchData();
    }, []);

    const formik = useFormik({
        initialValues: {
            event_cat_id: "",
            event_type_id: "",
            event_location_id: "",
            reward_id: "",
            event_title: "",
            event_description: "",
            event_date: getTodayDate(),
            event_start_time: "09:00",
            event_end_time: "12:00",
            event_status_id: 3,
            imageFile: "",
            signup_limit: null,
        },
        validationSchema: yup.object({
            event_cat_id: yup.string().trim().required('Category is required'),
            event_type_id: yup.string().trim().required('Type is required'),
            event_location_id: yup.string().trim().required('Location is required'),
            reward_id: yup.number()
                .typeError('Reward must be a number')
                .required('Reward is required'),
            event_title: yup.string().trim()
                .min(3, 'Title must be at least 3 characters')
                .max(100, 'Title must be at most 100 characters')
                .required('Title is required'),
            event_description: yup.string().trim()
                .min(3, 'Description must be at least 3 characters')
                .max(1000, 'Description must be at most 1000 characters')
                .required('Description is required'),
            event_date: yup.string().trim()
                .required('Date is required')
                .test('is-today-or-future', 'Date cannot be in the past', (value) => {
                    return new Date(value) >= new Date(getTodayDate());
                }),
            event_start_time: yup.string().trim().required('Start time is required'),
            event_end_time: yup.string().trim().required('End time is required'),
            signup_limit: yup.number()
                .transform(value => (value === '' ? null : value)) // Convert empty string to null
                .nullable() // Allow null values
                .test('is-signup-limit-required', 'Signup limit is required if location is not Online', function (value) {
                    const { event_location_id } = this.parent;
                    return event_location_id === '5' || (value !== undefined && value !== null && value !== '');
                })
                .positive('Signup limit must be a positive number')
                .integer('Signup limit must be an integer')
                .notRequired(),
        }),

        onSubmit: (data) => {
            if (!imageFile) {
                setImageError('Image is required');
                toast.error('Image is required');
                return;
            }

            if (imageFile) {
                data.imageFile = imageFile;
            }
            data.event_title = data.event_title.trim();
            data.event_description = data.event_description.trim();
            data.reward_id = Number(data.reward_id); // Convert reward_id to a number

            // Validate end time is not before start time
            const startTime = new Date(`1970-01-01T${data.event_start_time}:00`);
            const endTime = new Date(`1970-01-01T${data.event_end_time}:00`);
            if (endTime <= startTime) {
                toast.error('End time must be after start time.');
                return;
            }

            http.post("/admin/event/create", data)
                .then((res) => {
                    toast.success("Event added successfully!");
                    navigate("/admin/event");
                })
                .catch((err) => {
                    toast.error("Failed to add event.");
                    console.log(err);
                });
        }
    });

    const handleLocationChange = (event) => {
        const selectedLocation = event.target.value;
        setEventLocation(selectedLocation);
        formik.handleChange(event); // This updates Formik's state
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 1024 * 1024) {
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
                    'Content-Type': 'multipart/form-data'
                }
            })
                .then((res) => {
                    toast.success("Image uploaded successfully!");
                    setImageFile(res.data.filename);
                    setImageError('');  // Clear any previous error
                })
                .catch((error) => {
                    toast.error("Failed to upload image.");
                    console.log(error.response);
                });
        }
    };

    const handleCancel = () => {
        navigate("/admin/event");
    };

    const handleDateChange = (date) => {
        setEventDate(date);
        formik.setFieldValue('event_date', date.toISOString().split('T')[0]); // Format date to YYYY-MM-DD
    };

    return (
        <form onSubmit={formik.handleSubmit} className="container mx-auto mt-8 p-4 bg-white shadow-md rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <h1 className="text-2xl font-semibold mb-6">Add Event</h1>

                <div className="mb-4">
                    <label className="block text-gray-700">Event Category <span className="text-red-500">*</span></label>
                    <select
                        id="event_cat_id"
                        name="event_cat_id"
                        value={formik.values.event_cat_id}
                        onChange={formik.handleChange}
                        className="select select-bordered w-full bg-white border-gray-300 text-gray-900"
                    >
                        <option value="" label="Select category" />
                        <option value={1}>Education</option>
                        <option value={2}>Recreation</option>
                        <option value={3}>Cultural</option>
                        <option value={4}>Social</option>
                    </select>
                    {formik.touched.event_cat_id && formik.errors.event_cat_id && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.event_cat_id}</p>
                    )}
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">Event Type <span className="text-red-500">*</span></label>
                    <select
                        id="event_type_id"
                        name="event_type_id"
                        value={formik.values.event_type_id}
                        onChange={formik.handleChange}
                        className="select select-bordered w-full bg-white border-gray-300 text-gray-900"
                    >
                        <option value="" label="Select type" />
                        <option value={1}>Workshop</option>
                        <option value={2}>Seminar</option>
                        <option value={3}>Festival</option>
                        <option value={4}>Community Gathering</option>
                    </select>
                    {formik.touched.event_type_id && formik.errors.event_type_id && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.event_type_id}</p>
                    )}
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">Event Location <span className="text-red-500">*</span></label>
                    <select
                        id="event_location_id"
                        name="event_location_id"
                        value={formik.values.event_location_id}
                        onChange={handleLocationChange}
                        className="select select-bordered w-full bg-white border-gray-300 text-gray-900"
                    >
                        <option value="" label="Select location" />
                        <option value={1}>Community Hall A</option>
                        <option value={2}>Outdoor Park</option>
                        <option value={3}>Conference Room B</option>
                        <option value={4}>Auditorium C</option>
                        <option value={5}>Online</option>
                    </select>
                    {formik.touched.event_location_id && formik.errors.event_location_id && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.event_location_id}</p>
                    )}
                </div>

                {formik.values.event_location_id !== '5' && (
                    <div className="mb-4">
                        <label className="block text-gray-700">Signup Limit <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            id="signup_limit"
                            name="signup_limit"
                            value={formik.values.signup_limit}
                            onChange={formik.handleChange}
                            className="input input-bordered w-full bg-white border-gray-300 text-gray-900"
                        />
                        {formik.touched.signup_limit && formik.errors.signup_limit && (
                            <p className="text-red-500 text-xs mt-1">{formik.errors.signup_limit}</p>
                        )}
                    </div>
                )}

                <div className="mb-4">
                    <label className="block text-gray-700">Reward <span className="text-red-500">*</span></label>
                    <select
                        id="reward_id"
                        name="reward_id"
                        value={formik.values.reward_id}
                        onChange={formik.handleChange}
                        className="select select-bordered w-full bg-white border-gray-300 text-gray-900"
                    >
                        <option value="" label="Select reward" />
                        {rewards.map((reward) => (
                            <option
                                key={reward.reward_id} // Add a unique key prop here
                                value={reward.reward_id}
                            >
                                {reward.reward_name}
                            </option>
                        ))}
                    </select>
                    {formik.touched.reward_id && formik.errors.reward_id && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.reward_id}</p>
                    )}
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">Event Title <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        id="event_title"
                        name="event_title"
                        value={formik.values.event_title}
                        onChange={formik.handleChange}
                        className="input input-bordered w-full bg-white border-gray-300 text-gray-900"
                    />
                    {formik.touched.event_title && formik.errors.event_title && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.event_title}</p>
                    )}
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">Event Description <span className="text-red-500">*</span></label>
                    <textarea
                        id="event_description"
                        name="event_description"
                        value={formik.values.event_description}
                        onChange={formik.handleChange}
                        className="textarea textarea-bordered w-full bg-white border-gray-300 text-gray-900"
                        rows="4"
                    />
                    <CharacterCounter text={formik.values.event_description} maxLength={1000} />
                    {formik.touched.event_description && formik.errors.event_description && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.event_description}</p>
                    )}
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">Event Date <span className="text-red-500">*</span></label>
                    <DatePicker
                        selected={eventDate}
                        onChange={handleDateChange}
                        className="input input-bordered w-full bg-white border-gray-300 text-gray-900"
                        dateFormat="yyyy-MM-dd"
                    />
                    {formik.touched.event_date && formik.errors.event_date && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.event_date}</p>
                    )}
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">Event Start Time <span className="text-red-500">*</span></label>
                    <input
                        type="time"
                        id="event_start_time"
                        name="event_start_time"
                        value={formik.values.event_start_time}
                        onChange={formik.handleChange}
                        className="input input-bordered w-full bg-white border-gray-300 text-gray-900"
                    />
                    {formik.touched.event_start_time && formik.errors.event_start_time && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.event_start_time}</p>
                    )}
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">Event End Time <span className="text-red-500">*</span></label>
                    <input
                        type="time"
                        id="event_end_time"
                        name="event_end_time"
                        value={formik.values.event_end_time}
                        onChange={formik.handleChange}
                        className="input input-bordered w-full bg-white border-gray-300 text-gray-900"
                    />
                    {formik.touched.event_end_time && formik.errors.event_end_time && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.event_end_time}</p>
                    )}
                </div>

                <div className="flex justify-between mt-4">
                    <button
                        type="submit"
                        className="btn btn-primary w-full mr-2"
                    >
                        Add Event
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="btn btn-third w-full"
                    >
                        Cancel
                    </button>
                </div>
            </div>

            <div className="mt-8 md:mt-0">
                <h2 className="text-xl font-semibold mb-6">Upload Event Image <span className="text-red-500">*</span></h2>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50"
                />
                {imageError && (
                    <p className="text-red-500 text-xs mt-1">{imageError}</p>
                )}
                {imageFile && (
                    <div className="mt-4">
                        <img src={`${import.meta.env.VITE_FILE_BASE_URL}${imageFile}`} alt="Event" className="max-w-full h-auto rounded-lg shadow-md" />
                    </div>
                )}
            </div>
            <ToastContainer />
        </form>
    );
}

export default AddEvent;
