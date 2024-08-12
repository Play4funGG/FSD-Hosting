const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const {User} = require('../models'); // Adjust the path as needed
const { sign } = require('jsonwebtoken'); // Import sign from jsonwebtoken
require('dotenv').config(); // Make sure to have dotenv installed and configured

const router = express.Router();

const client = new OAuth2Client("208554047878-jh3n66khbbc5uhj8fdg42k0thhmhp5i7.apps.googleusercontent.com");

router.post('/google-login', async (req, res) => {
    const { credential } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: "208554047878-jh3n66khbbc5uhj8fdg42k0thhmhp5i7.apps.googleusercontent.com",
        });
        const { email_verified, email, given_name, family_name } = ticket.getPayload();
        
        if (email_verified) {
            let user = await User.findOne({ where: { email } });
            
            if (!user) {
                const username = email.split('@')[0];
                user = await User.create({
                    user_type_id: 1,
                    first_name: given_name,
                    last_name: family_name,
                    email: email,
                    username: username,
                    password: "google",
                });
            }
            


            const userInfo = {
                id: user.user_id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                username: user.username,
                user_type_id: user.user_type_id,
                password: user.password
            };

            let accessToken = sign(userInfo, process.env.APP_SECRET, 
                { expiresIn: process.env.TOKEN_EXPIRES_IN });
            console.log(accessToken);
            console.log(userInfo);
            res.json({
                accessToken: accessToken,
                user: userInfo
            });
        } else {
            res.status(400).json({ success: false, message: "Email not verified" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
});

module.exports = router;