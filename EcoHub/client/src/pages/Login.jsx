import React, { useContext, useState } from 'react';
import { Box, Typography, TextField, Button, InputAdornment, Link, Checkbox, FormControlLabel, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../http';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserContext from '../contexts/UserContext';
import { AccountCircle, Email, Lock } from '@mui/icons-material';
import backgroundImage from '../assets/green-background.png';
import GoogleIcon from '../assets/google-icon.svg';
import { GoogleLogin } from '@react-oauth/google';


function Login() {
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);
    const [showPassword, setShowPassword] = useState(false);

    const handleToggleShowPassword = () => setShowPassword(!showPassword);

    const handleGoogleSuccess = (credentialResponse) => {
        http.post("/user/google-login", { credential: credentialResponse.credential })
            .then((res) => {
                localStorage.setItem("accessToken", res.data.accessToken);
                setUser(res.data.user);
                toast.success("Google login successful.");
                navigate("/");

            })
            .catch(function (err) {
                toast.error(`${err.response.data.message}`);
            });
    };

    const handleGoogleFailure = () => {
        toast.error("Google login failed. Please try again.");
    };


    const formik = useFormik({
        initialValues: {
            email: "",
            password: ""
        },
        validationSchema: yup.object({
            email: yup.string().trim()
                .email('Enter a valid email')
                .max(50, 'Email must be at most 50 characters')
                .required('Email is required'),
            password: yup.string().trim()
                .min(8, 'Password must be at least 8 characters')
                .max(50, 'Password must be at most 50 characters')
                .required('Password is required')
        }),

        onSubmit: (data) => {
            data.email = data.email.trim().toLowerCase();
            data.password = data.password.trim();
            http.post("/user/login", data)
                .then((res) => {
                    localStorage.setItem("accessToken", res.data.accessToken);
                    setUser(res.data.user);
                    toast.success("Login successful.");
                    if (res.data.user.user_type_id === 2) {
                        navigate("/admin/adminhome");
                    } else if (res.data.user.user_type_id === 3) {
                        navigate("/organiser/proposal");
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
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '110vh',
            padding: 2,
            transform: 'translateY(-100px)', // Move the box up slightly
        }}>
            <Box sx={{
                display: 'flex',
                width: '80%',
                height: '70%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 2,
                boxShadow: 3,
                overflow: 'hidden',
            }}>
                <Box sx={{
                    flex: 1.1,
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '8px 0 0 8px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    padding: 4,
                }}>

                </Box>
                <Box sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 4,
                }}>
                    <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', alignSelf: 'flex-start', width: '100%', fontWeight: 'bold' }}>
                        Login
                    </Typography>
                    <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%', alignContent: "center", alignItems: "center" }}>
                        <Box sx={{ width: '100%', mb: 2 }}>
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleFailure}
                                useOneTap
                                theme="outline"
                                size="large"
                                text="signin_with"
                                shape="rectangular"
                                width="100%"
                                logo_alignment="left"
                                containerProps={{
                                    style: {
                                        width: '100%',
                                        justifyContent: 'center',
                                        display: 'flex'
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    display: 'flex',
                                    maxWidth: 'none'
                                }}
                            />
                        </Box>
                        <Divider sx={{ width: '100%' }}>
                            <Typography variant="body2" sx={{ px: 2 }}>
                                OR
                            </Typography>
                        </Divider>

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
                            label="Password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.password && Boolean(formik.errors.password)}
                            helperText={formik.touched.password && formik.errors.password}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Lock />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <FormControlLabel
                            control={<Checkbox checked={showPassword} onChange={handleToggleShowPassword} color="primary" />}
                            label="Show Password"
                            sx={{ mt: 1 }}
                        />
                        <Button fullWidth variant="contained" sx={{ mt: 2, backgroundColor: 'green', height: '56px', '&:hover': { backgroundColor: 'darkgreen' } }} type="submit">
                            Login
                        </Button>
                    </Box>
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="body2">
                            Don't have an account? <Link href="/register" variant="body2" fontWeight="bold" sx={{ color: 'green' }}>Sign up</Link>
                        </Typography>
                    </Box>
                </Box>
            </Box>
            <ToastContainer />
        </Box>
    );
}

export default Login;
