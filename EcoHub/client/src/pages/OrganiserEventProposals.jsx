import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import http from '../http';
import { Pagination, Button } from '@mui/material';
import 'tailwindcss/tailwind.css';
import 'daisyui';

function OrganiserEventProposal() {
    const navigate = useNavigate();
    const [events, setProposals] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    const getProposals = () => {
        http.get('/organiser/proposal')
            .then(res => {
                console.log('Response data:', res.data);  // Log the response data for debugging
                setProposals(res.data);
            })
            .catch(error => console.error('Error fetching proposals:', error));  // Log errors
    };

    const handleAddProposal = () => {
        navigate('/organiser/proposal/create');
    };

    const handleViewProposal = (eventId) => {
        navigate(`/organiser/proposal/${eventId}`);
    };

    useEffect(() => {
        getProposals();
    }, []);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const columns = [
        { field: 'id', headerName: 'ID' },
        { field: 'eventdate', headerName: 'Event Date' },
        { field: 'eventtime', headerName: 'Event Time' },
        { field: 'eventname', headerName: 'Event Name' },
        { field: 'eventlocation', headerName: 'Event Location' },
        { field: 'eventorganiser', headerName: 'Organised By' },
        { field: 'eventstatus', headerName: 'Event Status' },
        { field: 'signup_limit', headerName: 'Signup Limit' }, // Added signup_limit column
        { field: 'eventaction', headerName: 'Event Action' },
    ];

    const rows = events.map((event, index) => ({
        id: index + 1,  // Could be changed to event.event_id if you prefer to use the actual ID
        eventdate: event.event_date ? new Date(event.event_date).toLocaleDateString() : 'Invalid Date',
        eventtime: event.event_start_time,
        eventname: event.event_title,
        eventlocation: event.eventLocation.event_location_description,
        eventorganiser: event.user.username,
        eventstatus: event.eventStatus.description,
        signup_limit: event.signup_limit !== null ? event.signup_limit : '-', // Handle null values
        eventaction: (
            event.eventStatus.description === 'Rejected' ? (
                <button
                    onClick={() => navigate(`/organiser/proposal/update/${event.event_id}`)}
                    className="text-blue-500 hover:underline"
                >
                    Update
                </button>
            ) : (
                <button
                    onClick={() => handleViewProposal(event.event_id)}
                    className="text-blue-500 hover:underline"
                >
                    View
                </button>
            )
        ),
    }));

    const paginatedRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="flex">
            {/* Side Menu */}
            <div className="w-64 bg-white shadow-md p-4 fixed h-full">
                <h2 className="text-lg font-bold mb-4">Organiser Navigation</h2>
                <ul className="space-y-2">
                    <li>
                        <button
                            onClick={() => navigate('/organiser/event')}
                            className="w-full text-left p-2 rounded hover:bg-gray-100"
                        >
                            Events
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => navigate('/organiser/proposal')}
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
                    <h1 className="text-4xl font-bold mb-6">Event Proposals from Event Organiser</h1>
                    <div className="overflow-x-auto">
                        <Button
                            onClick={handleAddProposal}
                            variant="contained"
                            color="primary"
                            className="rounded-full mb-4 p-4" // Added padding here
                        >
                            Add Event Proposal
                        </Button>
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
                                            <td key={col.field}>{row[col.field]}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Pagination
                            count={Math.ceil(rows.length / pageSize)}
                            page={currentPage}
                            onChange={handlePageChange}
                            variant="outlined"
                            color="primary"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrganiserEventProposal;
