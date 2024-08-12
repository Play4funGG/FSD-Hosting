import React, { useContext, useState } from 'react';
import { Box, Typography, TextField, Button, InputAdornment, FormControlLabel, Checkbox, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../http';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserContext from '../contexts/UserContext';
import { Email, Phone, LocationOn, Lock } from '@mui/icons-material';

function Register() {
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);
    const [showPassword, setShowPassword] = useState(false);

    const handleToggleShowPassword = () => setShowPassword(!showPassword);

    const formik = useFormik({
        initialValues: {
            user_type_id: 1,
            first_name: "",
            last_name: "",
            username: "",
            email: "",
            phone_no: "",
            location: "",
            password: "",
            confirmPassword: ""
        },
        validationSchema: yup.object({
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
            password: yup.string().trim().min(8).max(50).required()
                .matches(/^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/,
                    "Password must contain at least 1 letter and 1 number."),
            confirmPassword: yup.string().trim()
                .required('Confirm password is required')
                .oneOf([yup.ref('password')], 'Passwords must match')
        }),
        onSubmit: (data) => {
            data.first_name = data.first_name.trim();
            data.last_name = data.last_name.trim();
            data.username = data.username.trim();
            data.email = data.email.trim().toLowerCase();
            data.phone_no = data.phone_no.trim();
            data.location = data.location.trim();
            data.password = data.password.trim();

            http.post("/user/register", data)
                .then((res) => {
                    localStorage.setItem("accessToken", res.data.accessToken);
                    setUser(res.data.user);
                    toast.success("Registration successful.");
                    if (res.data.user.user_type_id === 2) {
                        navigate("/admin/adminhome");
                    } else {
                        navigate("/");
                    }
                })
                .catch(function (err) {
                    toast.error(`${err.response.data.message}`);
                });
        }
    });

    return (
        <Box sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <Box sx={{
                width: '80%',
                maxWidth: '600px',
                padding: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 2,
                boxShadow: 3,
            }}>
                <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
                    Register
                </Typography>
                <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                        <TextField
                            fullWidth
                            margin="dense"
                            autoComplete="off"
                            label="First Name"
                            name="first_name"
                            value={formik.values.first_name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                            helperText={formik.touched.first_name && formik.errors.first_name}
                            sx={{ width: '48%' }}
                        />
                        <TextField
                            fullWidth
                            margin="dense"
                            autoComplete="off"
                            label="Last Name"
                            name="last_name"
                            value={formik.values.last_name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                            helperText={formik.touched.last_name && formik.errors.last_name}
                            sx={{ width: '48%' }}
                        />
                        <TextField
                            fullWidth
                            margin="dense"
                            autoComplete="off"
                            label="Username"
                            name="username"
                            value={formik.values.username}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.username && Boolean(formik.errors.username)}
                            helperText={formik.touched.username && formik.errors.username}
                            sx={{ width: '100%' }}
                        />
                        <TextField
                            fullWidth
                            margin="dense"
                            autoComplete="off"
                            label="Email"
                            name="email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.email && Boolean(formik.errors.email)}
                            helperText={formik.touched.email && formik.errors.email}
                            sx={{ width: '100%' }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Email />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            fullWidth
                            margin="dense"
                            autoComplete="off"
                            label="Phone Number"
                            name="phone_no"
                            value={formik.values.phone_no}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.phone_no && Boolean(formik.errors.phone_no)}
                            helperText={formik.touched.phone_no && formik.errors.phone_no}
                            sx={{ width: '100%' }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Phone />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            fullWidth
                            margin="dense"
                            autoComplete="off"
                            label="Location"
                            name="location"
                            value={formik.values.location}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.location && Boolean(formik.errors.location)}
                            helperText={formik.touched.location && formik.errors.location}
                            sx={{ width: '100%' }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <LocationOn />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            fullWidth
                            margin="dense"
                            autoComplete="off"
                            label="Password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.password && Boolean(formik.errors.password)}
                            helperText={formik.touched.password && formik.errors.password}
                            sx={{ width: '48%' }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Lock />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            fullWidth
                            margin="dense"
                            autoComplete="off"
                            label="Confirm Password"
                            name="confirmPassword"
                            type={showPassword ? 'text' : 'password'}
                            value={formik.values.confirmPassword}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                            sx={{ width: '48%' }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Lock />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                    <FormControlLabel
                        control={<Checkbox checked={showPassword} onChange={handleToggleShowPassword} color="primary" />}
                        label="Show Password"
                        sx={{ mt: 2 }}
                    />
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="body2">
                            Already have an account? <Link href="/login" variant="body2" fontWeight="bold" sx={{ color: "green" }}>Login</Link>
                        </Typography>
                    </Box>

                    <Button fullWidth variant="contained" sx={{ mt: 2, backgroundColor: 'green', '&:hover': { backgroundColor: 'darkgreen' } }} type="submit">
                        Register
                    </Button>
                </Box>
                <ToastContainer />
            </Box>
        </Box>
    );
}

export default Register;
