import React, { useState, useEffect } from 'react';
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import http from '../http';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminHome = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    user_type_id: '',
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone_no: '',
    location: '',
    password: ''
  });
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUserType, setFilterUserType] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterUserType]);

  const fetchUsers = async () => {
    try {
      const response = await http.get('/user/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error fetching users');
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterUserType) {
      filtered = filtered.filter(user => user.user_type_id.toString() === filterUserType);
    }

    setFilteredUsers(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterUserType(e.target.value);
  };

  const handleCreateUser = async () => {
    try {
      const data = {
        ...formData,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        phone_no: formData.phone_no.trim(),
        location: formData.location.trim(),
        password: formData.password
      };

      await http.post('/user/users', data);
      fetchUsers();
      clearForm();
      setOpenCreateDialog(false);
      toast.success('User created successfully!');
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.response?.data?.msg || 'Error creating user');
    }
  };

  const handleUpdateUser = async () => {
    try {
      if (!selectedUser) {
        toast.error('No user selected for update');
        return;
      }

      const data = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        phone_no: typeof formData.phone_no === 'string' ? formData.phone_no.trim() : formData.phone_no,
        location: formData.location.trim()
      };

      await http.post(`/user/users/${selectedUser.user_id}`, data);
      fetchUsers();
      clearForm();
      setSelectedUser(null);
      toast.success('User updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.msg || 'Error updating user');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await http.delete(`/user/users/${userToDelete.user_id}`);
      fetchUsers();
      setOpenDeleteDialog(false);
      toast.success('User deleted successfully!');
    } catch (error) {
      toast.error(`${error.response?.data?.message || 'Error deleting user'}`);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setFormData(user);
  };

  const clearForm = () => {
    setSelectedUser(null);
    setFormData({
      user_type_id: '',
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      phone_no: '',
      location: '',
      password: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openCreateDialogHandler = () => {
    setOpenCreateDialog(true);
  };

  const closeCreateDialogHandler = () => {
    setOpenCreateDialog(false);
    clearForm();
  };

  const openDeleteDialogHandler = (user) => {
    setUserToDelete(user);
    setOpenDeleteDialog(true);
  };

  const closeDeleteDialogHandler = () => {
    setOpenDeleteDialog(false);
    setUserToDelete(null);
  };

  return (
    <Grid container spacing={3}>
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
            <Link to="/admin/event" className="text-blue-600 hover:underline ">Events</Link>
          </li>
        </ul>
      </nav>


      <Grid item xs={12}>
        <Typography variant="h4" align="center">Admin Home</Typography>
      </Grid>

      <Grid item xs={12} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            label="Search"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ marginRight: '10px' }}
          />
          <FormControl variant="outlined" style={{ minWidth: 120 }}>
            <InputLabel id="user-type-filter-label">User Type</InputLabel>
            <Select
              labelId="user-type-filter-label"
              value={filterUserType}
              onChange={handleFilterChange}
              label="User Type"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="1">Normal User</MenuItem>
              <MenuItem value="2">Admin</MenuItem>
              <MenuItem value="3">Manager</MenuItem>
            </Select>
          </FormControl>
        </div>
        <Button variant="contained" color="primary" onClick={openCreateDialogHandler}>Create User</Button>
      </Grid>

      <Grid item xs={12}>
        <Paper elevation={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User ID</TableCell>
                  <TableCell>User Type ID</TableCell>
                  <TableCell>First Name</TableCell>
                  <TableCell>Last Name</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone No</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map(user => (
                  <TableRow key={user.user_id}>
                    <TableCell>{user.user_id}</TableCell>
                    <TableCell>{user.user_type_id}</TableCell>
                    <TableCell>{user.first_name}</TableCell>
                    <TableCell>{user.last_name}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone_no}</TableCell>
                    <TableCell>{user.location}</TableCell>
                    <TableCell>
                      <Button variant="contained" onClick={() => handleSelectUser(user)} style={{ backgroundColor: 'green', color: 'white', marginRight: '10px' }}>Edit</Button>
                      <Button variant="contained" onClick={() => openDeleteDialogHandler(user)} style={{ backgroundColor: 'red', color: 'white' }}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>

      {selectedUser && (
        <Grid item xs={12}>
          <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
            <Typography variant="h6">Edit User</Typography>
            <TextField
              margin="dense"
              id="first_name"
              name="first_name"
              label="First Name"
              type="text"
              fullWidth
              value={formData.first_name}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              id="last_name"
              name="last_name"
              label="Last Name"
              type="text"
              fullWidth
              value={formData.last_name}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              id="username"
              name="username"
              label="Username"
              type="text"
              fullWidth
              value={formData.username}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              id="email"
              name="email"
              label="Email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              id="phone_no"
              name="phone_no"
              label="Phone No"
              type="text"
              fullWidth
              value={formData.phone_no}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              id="location"
              name="location"
              label="Location"
              type="text"
              fullWidth
              value={formData.location}
              onChange={handleChange}
            />
            <Button variant="contained" color="primary" onClick={handleUpdateUser} style={{ marginTop: '20px' }}>
              Update User
            </Button>
            <Button variant="contained" color="secondary" onClick={clearForm} style={{ marginTop: '20px', marginLeft: '10px' }}>
              Cancel
            </Button>
          </Paper>
        </Grid>
      )}

      <Dialog open={openCreateDialog} onClose={closeCreateDialogHandler} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Create User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="user_type_id"
            name="user_type_id"
            label="User Type ID"
            type="text"
            fullWidth
            value={formData.user_type_id}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            id="first_name"
            name="first_name"
            label="First Name"
            type="text"
            fullWidth
            value={formData.first_name}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            id="last_name"
            name="last_name"
            label="Last Name"
            type="text"
            fullWidth
            value={formData.last_name}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            id="username"
            name="username"
            label="Username"
            type="text"
            fullWidth
            value={formData.username}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            id="email"
            name="email"
            label="Email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            id="phone_no"
            name="phone_no"
            label="Phone No"
            type="text"
            fullWidth
            value={formData.phone_no}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            id="location"
            name="location"
            label="Location"
            type="text"
            fullWidth
            value={formData.location}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            id="password"
            name="password"
            label="Password"
            type="password"
            fullWidth
            value={formData.password}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCreateDialogHandler} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleCreateUser} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={closeDeleteDialogHandler} aria-labelledby="delete-dialog-title">
        <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this user?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialogHandler} style={{ backgroundColor: 'green', color: 'white', marginRight: '10px' }}>
            Cancel
          </Button>
          <Button onClick={handleDeleteUser} style={{ backgroundColor: 'red', color: 'white' }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer />
    </Grid>
  );
};

export default AdminHome;