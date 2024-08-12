import React, { useState } from 'react';
import emailjs from 'emailjs-com';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';

const ContactUs = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    emailjs.sendForm('service_2u6maif', 'template_4ck3s64', e.target, 'fz6hW6BCHgWSZMzv_')
      .then(
        (result) => {
          console.log(result.text);
          alert('Message sent successfully!');
          setName('');
          setEmail('');
          setMessage('');
        },
        (error) => {
          console.log(error.text);
          alert('Failed to send message. Please try again.');
        }
      );
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f4f8' }}>
      <Paper elevation={3} sx={{ padding: 4, width: '100%', maxWidth: 500 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Contact Us
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Name"
            variant="outlined"
            margin="normal"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            margin="normal"
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Message"
            variant="outlined"
            margin="normal"
            id="message"
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            multiline
            rows={4}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            sx={{ mt: 2 }}
          >
            Send
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default ContactUs;
