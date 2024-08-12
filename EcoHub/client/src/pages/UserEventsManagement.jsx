import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Avatar, Button } from '@mui/material';
import { AccountCircle, Event, Redeem } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import UserContext from '../contexts/UserContext';
import EventBookings from './EventBookings'; // Import the EventBookings component for easier access
import http from '../http'; 

const UserEventsManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(UserContext);
  const [userId, setUserId] = useState(null);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchUserIdAndBookings = async () => {
      try {
        const authResponse = await http.get('/user/auth');
        const id = authResponse.data.user.id;
        setUserId(id);
        console.log('Authenticated user ID:', id);

        if (id) {
          const response = await http.get(`/events/all-user-signup?userId=${id}`);
          if (response && response.data) {
            setBookings(response.data);
            console.log('Fetched bookings:', response.data);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setUserId(null);
      }
    };

    fetchUserIdAndBookings();
  }, []);  // Re-fetch bookings whenever userId changes

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
        <EventBookings bookings={bookings}  />
      </Box>
    </Box>
  );
};

export default UserEventsManagement;
