import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../http';

const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

// Character counter component
const CharacterCounter = ({ text, maxLength }) => {
    const [count, setCount] = useState(text.length);

    useEffect(() => {
        setCount(text.length);
    }, [text]);

    return (
        <Typography variant="body2" color={count > maxLength ? 'error' : 'inherit'}>
            {count}/{maxLength}
        </Typography>
    );
};

function AddReward() {
    const navigate = useNavigate();
    const formik = useFormik({
        initialValues: {
            reward_name: '',
            rewards_type_id: '',
            reward_quantity: '',
            reward_duration: '',
            reward_description: '',
            // Keep existing fields...
        },
        validationSchema: yup.object({
            reward_name: yup.string().trim().required('Reward name is required'),
            rewards_type_id: yup.number().integer().required('Type ID is required'),
            reward_quantity: yup.number().integer().required('Quantity is required'),
            reward_duration: yup.number().required('Duration is required').typeError('Invalid duration'),
            reward_description: yup.string().trim()
              .min(3, 'Description must be at least 3 characters')
              .max(1000, 'Description must be at most 1000 characters')
              .required('Description is required'),
            // Validation for existing fields...
        }),
        onSubmit: (data) => {
            http.post("/rewards/add", data)
                .then((res) => {
                    console.log(res.data)
                    navigate("/rewards")
                });

        }
    
    });

    return (
        <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3, marginLeft: 20 }}>
        {/* Existing form elements... */}
        <div  className="flex flex-col space-y-4 container mx-auto mt-8 p-4 bg-grey shadow-md rounded-lg">
        <TextField
                fullWidth
                id="reward_name"
                name="reward_name"
                label="Reward Name"
                value={formik.values.reward_name}
                onChange={formik.handleChange}
                error={formik.touched.reward_name && Boolean(formik.errors.reward_name)}
                helperText={formik.touched.reward_name && formik.errors.reward_name}
                margin="normal"
                sx={{ width: '30%' }}
            />

            <TextField
                fullWidth
                id="rewards_type_id"
                name="rewards_type_id"
                label="Rewards Type ID"
                type="number"
                value={formik.values.rewards_type_id}
                onChange={formik.handleChange}
                error={formik.touched.rewards_type_id && Boolean(formik.errors.rewards_type_id)}
                helperText={formik.touched.rewards_type_id && formik.errors.rewards_type_id}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                sx={{ width: '30%' }}
            />

            <TextField
                fullWidth
                id="reward_quantity"
                name="reward_quantity"
                label="Reward Quantity"
                type="number"
                value={formik.values.reward_quantity}
                onChange={formik.handleChange}
                error={formik.touched.reward_quantity && Boolean(formik.errors.reward_quantity)}
                helperText={formik.touched.reward_quantity && formik.errors.reward_quantity}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                sx={{ width: '30%' }}
            />

            <TextField
                fullWidth
                id="reward_duration"
                name="reward_duration"
                label="Reward Duration"
                type="number"
                value={formik.values.reward_duration}
                onChange={formik.handleChange}
                error={formik.touched.reward_duration && Boolean(formik.errors.reward_duration)}
                helperText={formik.touched.reward_duration && formik.errors.reward_duration}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                sx={{ width: '30%' }}
            />

            <TextField
                fullWidth
                id="reward_description"
                name="reward_description"
                label="Reward Description"
                value={formik.values.reward_description}
                onChange={formik.handleChange}
                error={formik.touched.reward_description && Boolean(formik.errors.reward_description)}
                helperText={formik.touched.reward_description && formik.errors.reward_description}
                margin="normal"
                multiline
                rows={6} // Set the initial number of rows
                maxRows={10} // Set the maximum number of rows
                sx={{ width: '50%' }}
            />
            <CharacterCounter text={formik.values.reward_description} maxLength={1000} />
            <br />

            <Button
                color="primary"
                variant="contained"
                fullWidth
                type="submit"
                sx={{ width: '30%', mt: 3}}
            >
                Add Reward
            </Button>

        </div>
    </Box>
    );
}

export default AddReward;
