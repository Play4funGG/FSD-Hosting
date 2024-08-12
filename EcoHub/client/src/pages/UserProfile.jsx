import React, { useContext, useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, ListItemIcon, ListItemText, Avatar } from '@mui/material';
import { AccountCircle, Event, Redeem } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import UserContext from '../contexts/UserContext';
import http from '../http';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';


const validationSchema = yup.object({
  first_name: yup.string().trim().min(3).max(50).required()
    .matches(/^[a-zA-Z '-,.]+$/,
      "First name only allows letters, spaces, and characters: ' - , ."),
  last_name: yup.string().trim().min(3).max(50).required()
    .matches(/^[a-zA-Z '-,.]+$/,
      "Last name only allows letters, spaces, and characters: ' - , ."),
  username: yup.string().trim().min(3).max(50).required()
    .matches(/^[a-zA-Z0-9_]+$/,
      "Username only allows letters, numbers, and underscores."),
  email: yup.string().trim().lowercase().email().max(50).required(),
  phone_no: yup.string().trim().min(8).max(15).required()
    .matches(/^[0-9]{8,15}$/,
      "Phone number must be 8 -15 digits "),
  location: yup.string().trim().min(3).max(50).required()
    .matches(/^[a-zA-Z0-9 '-,.]+$/,
      "Location only allows letters, spaces, and characters: ' - , ."),
});

const UserProfile = () => {
  const [user, setUserProfile] = useState(null);

  const [editMode, setEditMode] = useState(false);

  const { setUser } = useContext(UserContext);

  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      http.get('/user/auth').then((res) => {
        const user_id = res.data.user.id;
        http.get(`/user/users/${user_id}`)
          .then(res => {
            setUserProfile(res.data);
            formik.setValues(res.data); // Initialize formik values with fetched user data
          })
          .catch(error => console.error('Error fetching user:', error));
      });
    }
  }, []);

  
  const formik = useFormik({
    initialValues: {
      user_type_id: '',
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      phone_no: '',
      location: ''
    },
    validationSchema,
    onSubmit: (values) => {
      http.post(`/user/users/${values.user_id}`, values)
        .then(res => {
          setUserProfile(values);
          setEditMode(false);
          setUser(values);
          toast.success('Profile updated successfully!');
        })
        .catch(error => toast.error(`${err.response.data.message}`)
        );
    },
  });

  if (!user) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }


  const getUserRole = () => {
    switch (formik.values.user_type_id) {
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

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
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

      <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
        <Box sx={{
          width: '100%',
          maxWidth: '600px',
          mx: 'auto',
          padding: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 2,
          boxShadow: 3,
        }}>
          <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
            User Profile
          </Typography>
          {editMode ? (
            <form onSubmit={formik.handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  margin="dense"
                  autoComplete="off"
                  label="First Name"
                  name="first_name"
                  value={formik.values.first_name}
                  onChange={formik.handleChange}
                  error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                  helperText={formik.touched.first_name && formik.errors.first_name}
                />
                <TextField
                  fullWidth
                  margin="dense"
                  autoComplete="off"
                  label="Last Name"
                  name="last_name"
                  value={formik.values.last_name}
                  onChange={formik.handleChange}
                  error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                  helperText={formik.touched.last_name && formik.errors.last_name}
                />
                <TextField
                  fullWidth
                  margin="dense"
                  autoComplete="off"
                  label="Email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
                <TextField
                  fullWidth
                  margin="dense"
                  autoComplete="off"
                  label="Username"
                  name="username"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  error={formik.touched.username && Boolean(formik.errors.username)}
                  helperText={formik.touched.username && formik.errors.username}
                />
                <TextField
                  fullWidth
                  margin="dense"
                  autoComplete="off"
                  label="Phone Number"
                  name="phone_no"
                  value={formik.values.phone_no}
                  onChange={formik.handleChange}
                  error={formik.touched.phone_no && Boolean(formik.errors.phone_no)}
                  helperText={formik.touched.phone_no && formik.errors.phone_no}
                />
                <TextField
                  fullWidth
                  margin="dense"
                  autoComplete="off"
                  label="Location"
                  name="location"
                  value={formik.values.location}
                  onChange={formik.handleChange}
                  error={formik.touched.location && Boolean(formik.errors.location)}
                  helperText={formik.touched.location && formik.errors.location}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ bgcolor: '#4CAF50', color: 'white', '&:hover': { bgcolor: '#388E3C' } }}
                  >
                    Save
                  </Button>
                  <Button
                    variant="contained"
                    sx={{ bgcolor: 'green', color: 'white', '&:hover': { bgcolor: '#D32F2F' } }}
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            </form>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                margin="dense"
                aria-readonly
                label="First Name"
                value={user.first_name}
                InputProps={{ style: { color: 'black' } }}
              />
              <TextField
                fullWidth
                margin="dense"
                aria-readonly
                label="Last Name"
                value={user.last_name}
                InputProps={{ style: { color: 'black' } }}
              />
              <TextField
                fullWidth
                margin="dense"
                aria-readonly
                label="Email"
                value={user.email}
                InputProps={{ style: { color: 'black' } }}
              />
              <TextField
                fullWidth
                margin="dense"
                aria-readonly
                label="Username"
                value={user.username}
                InputProps={{ style: { color: 'black' } }}
              />
              <TextField
                fullWidth
                margin="dense"
                aria-readonly
                label="Phone Number"
                value={user.phone_no}
                InputProps={{ style: { color: 'black' } }}
              />
              <TextField
                fullWidth
                margin="dense"
                aria-readonly
                label="Location"
                value={user.location || 'N/A'}
                InputProps={{ style: { color: 'black' } }}
              />
              <Button
                variant="contained"
                sx={{ bgcolor: 'green', color: 'white', '&:hover': { bgcolor: '#388E3C' }, mt: 2 }}
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </Button>
            </Box>
          )}
        </Box>
        <ToastContainer />
      </Box>
    </Box>

  );
};

export default UserProfile;