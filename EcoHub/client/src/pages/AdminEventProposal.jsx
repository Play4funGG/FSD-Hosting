import React, { useState, useEffect } from 'react';
import http from '../http';
import { useNavigate, Link } from 'react-router-dom';
import { Pagination, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import 'tailwindcss/tailwind.css';
import 'daisyui';

function AdminEventProposal() {
    const [events, setProposals] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10); // Default page size is 10
    const navigate = useNavigate();

    const getProposals = () => {
        http.get('/admin/proposals')
            .then(res => {
                console.log('Response data:', res.data);
                setProposals(res.data);
            })
            .catch(error => console.error('Error fetching proposals:', error));
    };

    const handleUpdateEvent = (eventId) => {
        navigate(`/admin/proposals/${eventId}`);
    };

    useEffect(() => {
        getProposals();
    }, []);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const handlePageSizeChange = (event) => {
        setPageSize(event.target.value);
        setCurrentPage(1); // Reset to first page when page size changes
    };

    const columns = [
        { field: 'id', headerName: 'ID' },
        { field: 'eventdate', headerName: 'Event Date' },
        { field: 'eventtime', headerName: 'Event Time' },
        { field: 'eventname', headerName: 'Event Name' },
        { field: 'eventlocation', headerName: 'Event Location' },
        { field: 'eventorganiser', headerName: 'Organised By' },
        { field: 'eventstatus', headerName: 'Event Status' },
        { field: 'signup_limit', headerName: 'Signup Limit' },
        { field: 'eventaction', headerName: 'Event Action' },
    ];

    const rows = events.map((event, index) => ({
        id: index + 1,
        eventdate: event.event_date ? new Date(event.event_date).toLocaleDateString() : 'Invalid Date',
        eventtime: event.event_start_time,
        eventname: event.event_title,
        eventlocation: event.eventLocation.event_location_description,
        eventorganiser: event.user.username,
        eventstatus: event.eventStatus.description,
        signup_limit: event.signup_limit,
        eventaction: (
            <button
                onClick={() => handleUpdateEvent(event.event_id)}
                className="text-blue-500 hover:underline"
            >
                Update
            </button>
        ),
    }));

    const paginatedRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <>
            {/* Secondary Navigation Bar */}
            <nav className="bg-gray-200 p-4 mb-4 rounded-lg">
                <ul className="flex space-x-4">
                    <li>
                        <Link to="/admin/adminhome" className="text-blue-600 hover:underline font-bold">Admin Home</Link>
                    </li>
                    <li>
                        <Link to="/admin/proposals" className="text-blue-600 hover:underline">Proposals</Link>
                    </li>
                    <li>
                        <Link to="/admin/event" className="text-blue-600 hover:underline">Events</Link>
                    </li>
                </ul>
            </nav>

            {/* Main Content */}
            <div className="container mx-auto mt-8 p-4 bg-white shadow-md rounded-lg">
                <h1 className="text-4xl font-bold mb-6">Event Proposals from Event Organiser</h1>

                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead className="bg-gray-800 text-white">
                            <tr>
                                {columns.map((col) => (
                                    <th key={col.field} className="p-2">{col.headerName}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedRows.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-100">
                                    {columns.map((col) => (
                                        <td key={col.field} className="p-2">{row[col.field]}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 flex items-center justify-end space-x-4">
                    <FormControl variant="outlined" className="w-32">
                        <InputLabel>Rows per page</InputLabel>
                        <Select
                            value={pageSize}
                            onChange={handlePageSizeChange}
                            label="Rows per page"
                        >
                            <MenuItem value={5}>5</MenuItem>
                            <MenuItem value={10}>10</MenuItem>
                            <MenuItem value={20}>20</MenuItem>
                        </Select>
                    </FormControl>
                    <Pagination
                        count={Math.ceil(rows.length / pageSize)}
                        page={currentPage}
                        onChange={handlePageChange}
                        variant="outlined"
                        color="primary"
                    />
                </div>
            </div>
        </>
    );
}

export default AdminEventProposal;
