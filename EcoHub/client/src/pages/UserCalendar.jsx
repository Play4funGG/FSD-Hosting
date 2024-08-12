import React, { useState, useEffect, useContext, useRef } from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Avatar, Button } from '@mui/material';
import { AccountCircle, Event, Redeem } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import UserContext from '../contexts/UserContext';
import http from '../http';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const UserCalendar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(UserContext);
  const [userId, setUserId] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef();

  useEffect(() => {
    const fetchUserIdAndEvents = async () => {
      try {
        const authResponse = await http.get('/user/auth');
        const id = authResponse.data.user.id;
        setUserId(id);
        console.log('Authenticated user ID:', id);

        if (id) {
          const response = await http.get(`/events/all-user-signup?userId=${id}`);
          if (response && response.data) {
            console.log('Fetched events:', response.data);
            const formattedEvents = response.data.map(event => ({
              id: event.events.event_id,
              title: event.events.event_title,
              start: new Date(event.events.event_date + 'T' + event.events.event_start_time),
              end: new Date(event.events.event_date + 'T' + event.events.event_end_time),
            }));
            setEvents(formattedEvents);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setUserId(null);
      }
    };

    fetchUserIdAndEvents();
  }, []);  // Re-fetch events whenever userId changes

  const getUserRole = () => {
    switch (user?.user_type_id) {
      case 1:
        return 'Role: User';
      case 2:
        return 'Role: Admin';
      case 3:
        return 'Role: Event Manager';
      default:
        return 'Role: Unknown Role';
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setShowModal(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Box sx={{
        width: 250,
        height: '60%',
        backgroundColor: '#f5f5f5',
        marginTop: 4,
        boxShadow: '2px 0px 5px rgba(0, 0, 0, 0.1)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px',
      }}>
        <Avatar sx={{ width: 80, height: 80, bgcolor: 'grey', mb: 2 }}>
          <AccountCircle sx={{ width: 60, height: 60 }} />
        </Avatar>
        <Typography variant="h6" sx={{ textAlign: 'center', mb: 1 }}>
          {user.username}
        </Typography>
        <Typography variant="body2" sx={{ textAlign: 'center', mb: 2 }}>
          {getUserRole()}
        </Typography>
        
        <List component="nav">
          <ListItem button onClick={() => navigate('/user/profile')} sx={{ paddingRight: '16px' }}>
            <ListItemIcon><AccountCircle /></ListItemIcon>
            <ListItemText primary="User Profile" />
          </ListItem>
          <ListItem button onClick={() => navigate('/user/events')} sx={{ paddingLeft: '16px' }}>
            <ListItemIcon><Event /></ListItemIcon>
            <ListItemText primary="Events" />
          </ListItem>
          <ListItem button onClick={() => navigate('/user/calendar')} sx={{ paddingLeft: '16px' }}>
            <ListItemIcon><Event /></ListItemIcon>
            <ListItemText primary="Event Calendar" />
          </ListItem>
          <ListItem button onClick={() => navigate('/user/rewards')} sx={{ paddingLeft: '16px' }}>
            <ListItemIcon><Redeem /></ListItemIcon>
            <ListItemText primary="Rewards" />
          </ListItem>
        </List>
      </Box>

      {/* Main content area */}
      <Box sx={{ flexGrow: 1, p: 3, marginLeft: 5, background: 'white', overflowY: 'auto', borderRadius: '16px'}}>
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 800, padding: 20 }}
          onSelectEvent={handleSelectEvent}
          dayLayoutAlgorithm="no-overlap"
          weekLayoutAlgorithm="no-overlap"
        />
      </Box>
      {showModal && (
        <div ref={modalRef} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(128, 128, 128, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '5px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 1
          }}>
            <strong className='underline bold'>Event Details</strong>
            <h2><strong>Event Name:</strong> {selectedEvent?.title}</h2>
            <p><strong>Date:</strong> {moment(selectedEvent?.start).format('MMMM DD, YYYY')}</p>
            <p><strong>Time:</strong> {moment(selectedEvent?.start).format('LT')} - {moment(selectedEvent?.end).format('LT')}</p>
            <Button variant="contained" color="primary" onClick={() => navigate(`/events/details/${selectedEvent?.id}`)}>View Details</Button>
            <p></p>
            <Button onClick={() => setShowModal(false)}>Close</Button>
          </div>
        </div>
      )}
    </Box>
  );
};

export default UserCalendar;
