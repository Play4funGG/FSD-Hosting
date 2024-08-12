const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User, Events, EventSignUp } = require('../models');
//const {getUsers, getUserById, createUser, updateUser, deleteUser} = require('../controllers/Users');
const argon2 = require('argon2');
const yup = require("yup");
const { sign } = require('jsonwebtoken');
const { validateToken } = require('../middlewares/auth');
const eventSignup = require('../models/eventSignup');
require('dotenv').config();

router.use(express.json());

//router.get("/users", getUsers);
router.post("/register", async (req, res) => {
    console.log("register start");
    console.log(req.body);
    let data = req.body;
    // Validate request body
    let validationSchema = yup.object({
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
        password: yup.string().trim().min(8).max(50).required()
            .matches(/^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/,
                "Password must contain at least 1 letter and 1 number."),
        phone_no: yup.string().trim().min(8).max(15).required()
            .matches(/^[0-9]{8}$/,
                "Phone number must be at least 8 digits "),
        location: yup.string().trim().min(3).max(50).required()
            .matches(/^[a-zA-Z0-9 '-,.]+$/,
                "Location only allows letters, spaces, and characters: ' - , ."),
    });
    try {
        data = await validationSchema.validate(data,
            { abortEarly: false });
        console.log(data);
        console.log(data.location);
        console.log("Check email");
        // Check email
        let user = await User.findOne({
            where: { email: data.email }
        });
        if (user) {
            res.status(400).json({ message: "Email already exists." });
            return;
        }   
       
        data.password = await argon2.hash(data.password);
        
        // Create user

        let result = await User.create(data);
        console.log(result);

        let userInfo = {
            id: result.user_id,
            email: result.email,
            username: result.username
        };
        let accessToken = sign(userInfo, process.env.APP_SECRET,
            { expiresIn: process.env.TOKEN_EXPIRES_IN });
        res.json({
            accessToken: accessToken,
            user: userInfo
        });
    }
    catch (err) {
        res.status(400).json({ errors: err.errors });
        console.log(err.errors);

    }
});


router.post("/login", async (req, res) => {
    let data = req.body;
    // Validate request body
    let validationSchema = yup.object({
        email: yup.string().trim().lowercase().email().max(50).required(),
        password: yup.string().trim().min(8).max(50).required()
    });
    try {
        data = await validationSchema.validate(data,
            { abortEarly: false });

        // Check email and password
        let errorMsg = "Email or password is not correct.";
        let user = await User.findOne({
            where: { email: data.email }
        });
        if (!user) {
            res.status(400).json({ message: errorMsg });
            return;
        }
        console.log(data.password, user.password)
        let match = await argon2.verify(user.password, data.password);
        if (!match) {
            res.status(400).json({ message: errorMsg });
            return;
        }

        // Return user info
        let userInfo = {
            id: user.user_id,
            user_type_id: user.user_type_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            username: user.username,
            phone_no: user.phone_no,
            location: user.location

        };
        let accessToken = sign(userInfo, process.env.APP_SECRET,
            { expiresIn: process.env.TOKEN_EXPIRES_IN });
        console.log(userInfo);
        res.json({
            accessToken: accessToken,
            user: userInfo
        });
    }
    catch (err) {
        res.status(400).json({ errors: err.errors });
        return;
    }
});


router.get("/auth", validateToken, (req, res) => {
    console.log(req.headers);
    let userInfo = {
        id: req.user.id,
        user_type_id: req.user.user_type_id,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email,
        username: req.user.name,
        phone_no: req.user.phone_no,
        location: req.user.location
    };
    console.log(userInfo);
    res.json({
        user: userInfo
    });
});


router.get('/users',  async (req, res) => {
    try {
        console.log("getting user");
        const response = await User.findAll({
            attributes:['user_id','user_type_id','first_name','last_name','username','email','phone_no','location'],
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
});

router.get('/users/:id', async (req, res) => {
    try {
        const response = await User.findOne({
            attributes:['user_id','user_type_id','first_name','last_name','username','email','phone_no','location'],
            where: {
                user_id: req.params.id
            }
        });
        if (!response) return res.status(404).json({msg: "No user found"});
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
});

router.post('/users', async (req, res) => {
    let validationSchema = yup.object({
        user_type_id: yup.number().required(),
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
        password: yup.string().trim().min(8).max(50).required()
            .matches(/^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/,
                "Password must contain at least 1 letter and 1 number."),
        phone_no: yup.string().trim().min(8).max(15).required()
            .matches(/^[0-9]{8,15}$/,
                "Phone number must be at least 8 digits "),
        location: yup.string().trim().min(3).max(50).required()
            .matches(/^[a-zA-Z0-9 '-,.]+$/,
                "Location only allows letters, spaces, and characters: ' - , ."),
    });
    let data = req.body;
    console.log(data);
    const {user_type_id, first_name, last_name, username, email, phone_no, password, location} = req.body;
    // Assuming password and confPassword validation is done client-side or here before hashing
    try {
        console.log("register start");
        // Validate request body
        data = await validationSchema.validate(data,
            { abortEarly: false });
        console.log(data);
            let user = await User.findOne({
                where: { email: data.email }
            });
            if (user) {
                res.status(400).json({ message: "Email already exists." });
                return;
            }   
            const hashPassword = await argon2.hash(password);
            console.log("Hashed Password: " + hashPassword);
        await User.create({
            user_type_id,
            first_name,
            last_name,
            username,
            email,
            phone_no,
            password: hashPassword,
            location
        });
        res.status(201).json({msg: "Register Success"});
    } catch (error) {
        res.status(400).json({msg: error.message});
    }
});

router.post('/users/:id', async (req, res) => {
    console.log("Starting Update User");
    let validationSchema = yup.object({
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
                "Phone number must be at least 8 digits "),
        location: yup.string().trim().min(3).max(50).required()
            .matches(/^[a-zA-Z0-9 '-,.]+$/,
                "Location only allows letters, spaces, and characters: ' - , ."),
    });

    let data = req.body;
    const user = await User.findOne({
        where: {
            user_id: req.params.id
        }
    });
    if(!user) return res.status(404).json({msg: "Error"});
    const {first_name, last_name, username, email, phone_no, location} = req.body;
    try {

        data = await validationSchema.validate(data,
        { abortEarly: false });

        await User.update({
            first_name: first_name,
            last_name: last_name,
            username: username,
            email: email,
            phone_no: phone_no,
            location: location
        },{
            where:{
                user_id: req.params.id
            }
        });
        console.log("User Updated");
        res.status(200).json({msg: "User Updated"});
    } catch (error) {
        res.status(400).json({msg: error.message});
    }
});

router.delete('/users/:id', async (req, res) => {
    const user = await User.findOne({
        where: {
            user_id: req.params.id
        }
    });
    if(!user) return res.status(404).json({msg: "User not found"});
    try {
        await User.destroy({
            where:{
                user_id: user.user_id
            }
        });
        res.status(200).json({msg: "User Deleted"});
    } catch (error) {
        res.status(400).json({msg: error.message});
    }
});

module.exports = router;
