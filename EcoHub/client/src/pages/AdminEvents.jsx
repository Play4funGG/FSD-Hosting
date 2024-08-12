import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import http from '../http';
import { Button, Pagination, TextField, Dialog, DialogContent, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { ViewModule, ViewList } from '@mui/icons-material';
import 'tailwindcss/tailwind.css';
import 'daisyui';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminEvents() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isTableView, setIsTableView] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [tablePageSize, setTablePageSize] = useState(10); // Use state for table page size
    const [imagePageSize, setImagePageSize] = useState(9); // Use state for image view page size

    const getEvents = (filter, searchQuery) => {
        const filterQuery = filter === 'all' ? '' : `?filter=${filter}`;
        http.get(`/admin/event${filterQuery}`)
            .then(res => {
                const filteredEvents = res.data.filter(event => {
                    const eventDate = event.event_date ? new Date(event.event_date).toLocaleDateString() : '';
                    return (
                        event.event_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        eventDate.includes(searchQuery)
                    );
                });
                setEvents(filteredEvents);
            })
            .catch(error => {
                console.error('Error fetching events:', error);
                toast.error('Error fetching events.');
            });
    };

    useEffect(() => {
        getEvents(filter, searchQuery);
    }, [filter, searchQuery]);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const handleAddEvent = () => {
        navigate('/admin/event/create');
    };

    const handleUpdateEvent = (eventId) => {
        navigate(`/admin/event/${eventId}`);
    };

    const handleImageClick = (image) => {
        setSelectedImage(image);
        setOpenModal(true);
    };

    const handleTablePageSizeChange = (event) => {
        setTablePageSize(event.target.value);
        setCurrentPage(1); // Reset to first page when changing table page size
    };

    const handleImagePageSizeChange = (event) => {
        setImagePageSize(event.target.value);
        setCurrentPage(1); // Reset to first page when changing image view page size
    };

    const columns = [
        { field: 'id', headerName: 'ID' },
        { field: 'eventdate', headerName: 'Event Date' },
        { field: 'eventtime', headerName: 'Event Time' },
        { field: 'eventname', headerName: 'Event Name' },
        { field: 'eventlocation', headerName: 'Event Location' },
        { field: 'eventorganiser', headerName: 'Organised By' },
        { field: 'eventstatus', headerName: 'Event Status' },
        { field: 'signup_limit', headerName: 'Signup Limit' }, // New column
        { field: 'eventaction', headerName: 'Event Action' },
        { field: 'attendance', headerName: 'Attendance' },
    ];

    const rows = events.map((event) => ({
        id: event.event_id, // Use event_id instead of index
        eventdate: event.event_date ? new Date(event.event_date).toLocaleDateString() : 'Invalid Date',
        eventtime: event.event_start_time,
        eventname: event.event_title,
        eventlocation: event.eventLocation.event_location_description,
        eventorganiser: event.user.username,
        eventstatus: event.eventStatus.description,
        signup_limit: event.signup_limit !== null ? event.signup_limit : '-',
        eventImage: event.imageFile ? `${import.meta.env.VITE_FILE_BASE_URL}${event.imageFile}` : '',
        eventaction: (
            <button
                onClick={() => handleUpdateEvent(event.event_id)}
                className="text-blue-500 hover:underline"
            >
                Update
            </button>
        ),
        attendance: (
            <button
                onClick={() => navigate(`/admin/event/${event.event_id}/attendance`)}
                className="text-blue-500 hover:underline"
            >
                Attendance
            </button>
        ),
    }));

    const paginatedRows = isTableView
        ? rows.slice((currentPage - 1) * tablePageSize, currentPage * tablePageSize)
        : rows.slice((currentPage - 1) * imagePageSize, currentPage * imagePageSize);

    return (
        <div className="flex">
            {/* Side Menu */}
            <div className="w-64 bg-white shadow-md p-4 fixed shadow-md rounded-lg">
                <h2 className="text-lg font-bold mb-4">Admin Navigation</h2>
                <ul className="space-y-2">
                    <li>
                        <button
                            onClick={() => navigate('/admin/event')}
                            className="w-full text-left p-2 rounded hover:bg-gray-100"
                        >
                            Events
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => navigate('/admin/rewards')}
                            className="w-full text-left p-2 rounded hover:bg-gray-100"
                        >
                            Rewards
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => navigate('/admin/proposals')}
                            className="w-full text-left p-2 rounded hover:bg-gray-100"
                        >
                            Proposals
                        </button>
                    </li>
                </ul>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-64 p-4">
                <div className="container mx-auto mt-8 p-4 bg-white shadow-md rounded-lg">
                    <h1 className="text-4xl font-bold mb-6">Admin Event Management</h1>
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-2">
                            <Button
                                onClick={() => setFilter('all')}
                                variant={filter === 'all' ? 'contained' : 'outlined'}
                                color="primary"
                                className="rounded-full"
                            >
                                All Events
                            </Button>
                            <Button
                                onClick={() => setFilter('upcoming')}
                                variant={filter === 'upcoming' ? 'contained' : 'outlined'}
                                color="primary"
                                className="rounded-full"
                            >
                                Upcoming Events
                            </Button>
                            <Button
                                onClick={() => setFilter('past')}
                                variant={filter === 'past' ? 'contained' : 'outlined'}
                                color="primary"
                                className="rounded-full"
                            >
                                Past Events
                            </Button>
                            <TextField
                                id="outlined-basic"
                                variant="outlined"
                                label="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                size="small"
                                className="ml-2"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                onClick={handleAddEvent}
                                variant="contained"
                                color="primary"
                                className="rounded-full"
                            >
                                Add Event
                            </Button>
                            <Button
                                onClick={() => setIsTableView(!isTableView)}
                                variant="contained"
                                color="secondary"
                                className="rounded-full"
                                startIcon={isTableView ? <ViewModule /> : <ViewList />}
                            >
                                {isTableView ? 'Switch to Image View' : 'Switch to Table View'}
                            </Button>
                        </div>
                    </div>

                    {isTableView ? (
                        <div>
                            <div className="overflow-x-auto mb-4">
                                <table className="table w-full">
                                    <thead className="bg-gray-800 text-white">
                                        <tr>
                                            {columns.map((col) => (
                                                <th key={col.field}>{col.headerName}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedRows.map((row) => (
                                            <tr key={row.id}>
                                                {columns.map((col) => (
                                                    <td key={col.field}>
                                                        {row[col.field]}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                                {paginatedRows.map((row) => (
                                    <div
                                        key={row.id}
                                        className="bg-gray-100 p-4 shadow-md rounded-lg"
                                    >
                                        <img
                                            src={row.eventImage || 'https://via.placeholder.com/150'}
                                            alt={row.eventname}
                                            className="w-full h-32 object-cover rounded-md mb-4 cursor-pointer"
                                            onClick={() => handleImageClick(row.eventImage)}
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150'; }}
                                        />
                                        <h3 className="text-xl font-semibold mb-2">{row.eventname}</h3>
                                        <p>
                                            <strong>Date:</strong> {row.eventdate}
                                        </p>
                                        <p>
                                            <strong>Time:</strong> {row.eventtime}
                                        </p>
                                        <p>
                                            <strong>Location:</strong> {row.eventlocation}
                                        </p>
                                        <p>
                                            <strong>Signup Limit:</strong> {row.signup_limit}
                                        </p>
                                        <div className="mt-2">
                                            <button
                                                onClick={() => handleUpdateEvent(row.id)}
                                                className="text-blue-500 hover:underline block mb-2"
                                            >
                                                Update
                                            </button>
                                            <button
                                                onClick={() => navigate(`/admin/event/${row.id}/attendance`)}
                                                className="text-blue-500 hover:underline block"
                                            >
                                                Attendance
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-4 flex justify-end items-center">
                        <div className="flex items-center space-x-2">
                            {isTableView ? (
                                <FormControl variant="outlined" size="small" className="w-32">
                                    <InputLabel id="table-page-size-label">Rows per Page</InputLabel>
                                    <Select
                                        labelId="table-page-size-label"
                                        value={tablePageSize}
                                        onChange={handleTablePageSizeChange}
                                        label="Rows per Page"
                                    >
                                        <MenuItem value={5}>5</MenuItem>
                                        <MenuItem value={10}>10</MenuItem>
                                        <MenuItem value={20}>20</MenuItem>
                                    </Select>
                                </FormControl>
                            ) : (
                                <FormControl variant="outlined" size="small" className="w-32">
                                    <InputLabel id="image-page-size-label">Images per Page</InputLabel>
                                    <Select
                                        labelId="image-page-size-label"
                                        value={imagePageSize}
                                        onChange={handleImagePageSizeChange}
                                        label="Images per Page"
                                    >
                                        <MenuItem value={9}>9</MenuItem>
                                        <MenuItem value={18}>18</MenuItem>
                                    </Select>
                                </FormControl>
                            )}
                            <Pagination
                                count={Math.ceil(rows.length / (isTableView ? tablePageSize : imagePageSize))}
                                page={currentPage}
                                onChange={handlePageChange}
                                variant="outlined"
                                color="primary"
                            />
                        </div>
                    </div>

                    <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md">
                        <DialogContent>
                            <img
                                src={selectedImage}
                                alt="Enlarged"
                                className="w-full h-auto object-cover"
                            />
                        </DialogContent>
                    </Dialog>

                    <ToastContainer />
                </div>
            </div>
        </div>
    );
}

export default AdminEvents;
