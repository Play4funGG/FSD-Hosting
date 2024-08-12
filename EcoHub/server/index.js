const express = require('express');
const cors = require('cors');
require('dotenv').config();
 
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

// Enable CORS
app.use(cors({
    origin: process.env.CLIENT_URL,
    // origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"], //change from ["GET", "DELETE"] to this, include "OPTIONS" if needed - terrence
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Simple Route
app.get("/", (req, res) => {
    res.send("Welcome to the learning space.");
});

// Routes
const tutorialRoute = require('./routes/tutorial');
app.use("/tutorial", tutorialRoute);
const userRoute = require('./routes/user');
app.use("/user", userRoute);
const eventsRoute = require('./routes/events');
app.use("/events", eventsRoute);
const adminRoutes = require('./routes/admin');
app.use("/admin", adminRoutes);
const organiserRoutes = require('./routes/organiser');
app.use("/organiser", organiserRoutes);
const rewardsRoute = require('./routes/rewards')
app.use("/rewards", rewardsRoute);
const fileRoute = require('./routes/file');
app.use("/file", fileRoute);
const googleAuthRoutes = require('./routes/googleAuth'); // Adjust the path as needed
app.use('/user', googleAuthRoutes);


const db = require('./models');
db.sequelize.sync() //ensure no {alter:true} - terrence
    .then(() => {
        let port = process.env.APP_PORT || 3001;
        app.listen(port, () => {
            console.log(`⚡ Server running on http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.log(err);
    });
