import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import http from '../http';
import { Button, Checkbox, TextField } from '@mui/material';
import 'tailwindcss/tailwind.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function OrganiserAttendance() {
    const { eventId } = useParams(); // Get event ID from URL
    const navigate = useNavigate(); // Initialize the navigate function
    const [attendance, setAttendance] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [eventTitle, setEventTitle] = useState(''); // State to store event title

    // Fetch attendance for a specific event
    const getAttendance = async (eventId) => {
        try {
            const res = await http.get(`/organiser/event/${eventId}/attendance`);
            const attendanceData = res.data.attendance.map((entry) => ({
                ...entry,
                attendance: entry.attendance === 'marked', // Convert 'marked'/'not_marked' to boolean
            }));
            setAttendance(attendanceData);

            // Set the event title using the first entry
            if (attendanceData.length > 0) {
                setEventTitle(attendanceData[0].event_title); // Extract event title from the first entry
            } else {
                setEventTitle('Unknown Event'); // Fallback if no data is available
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
            toast.error('No users found for this event.');
        }
    };

    useEffect(() => {
        if (eventId) {
            getAttendance(eventId);
        }
    }, [eventId]);

    // Handle attendance checkbox change
    const handleAttendanceChange = (userId) => {
        setAttendance((prevState) =>
            prevState.map((entry) =>
                entry.user_id === userId ? { ...entry, attendance: !entry.attendance } : entry
            )
        );
    };

    // Update attendance data
    const handleUpdateAttendance = async () => {
        const updatedAttendance = attendance.map((entry) => ({
            userId: entry.user_id,
            attendance: entry.attendance ? 'marked' : 'not_marked',
        }));

        try {
            await http.put(`/organiser/event/${eventId}/attendance`, { attendanceUpdates: updatedAttendance });
            toast.success('Attendance updated successfully.');
            navigate('/organiser/event'); // Navigate back after successful update
        } catch (error) {
            console.error('Error updating attendance:', error);
            toast.error('Failed to update attendance.');
        }
    };

    // Cancel and navigate back without updating
    const handleCancel = () => {
        navigate('/organiser/event');
    };

    // Define columns for table view
    const columns = [
        { field: 'id', headerName: 'ID' },
        { field: 'username', headerName: 'Username' },
        { field: 'phone_no', headerName: 'Phone Number' },
        { field: 'attendance', headerName: 'Attendance' },
    ];

    // Filtered rows based on search query
    const filteredRows = attendance.filter((entry) =>
        entry.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.phone_no.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Map filtered attendance data to rows
    const rows = filteredRows.map((entry) => ({
        id: entry.user_id,
        username: entry.username, // Use the username from the attendance data
        phone_no: entry.phone_no, // Use the phone number from the attendance data
        attendance: entry.attendance,
    }));

    const paginatedRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="container mx-auto mt-8 p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-4xl font-bold mb-4">
                {`Event Attendance for ${eventTitle}`} {/* Display event title in header */}
            </h1>
            <div className="flex items-center mb-6">
                <TextField
                    label="Search"
                    variant="outlined"
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mr-4 w-80"
                />
            </div>
            <div className="overflow-x-auto mb-6">
                <table className="table w-full">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            {columns.map((col) => (
                                <th key={col.field} className="px-4 py-2">{col.headerName}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedRows.map((row) => (
                            <tr key={row.id} className="border-b">
                                <td className="px-4 py-2">{row.id}</td>
                                <td className="px-4 py-2">{row.username}</td>
                                <td className="px-4 py-2">{row.phone_no}</td>
                                <td className="px-4 py-2">
                                    <Checkbox
                                        checked={row.attendance}
                                        onChange={() => handleAttendanceChange(row.id)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex space-x-4">
                <Button variant="contained" color="primary" onClick={handleUpdateAttendance}>
                    Update
                </Button>
                <Button variant="outlined" color="secondary" onClick={handleCancel}>
                    Cancel
                </Button>
            </div>
            <ToastContainer />
        </div>
    );
}

export default OrganiserAttendance;
