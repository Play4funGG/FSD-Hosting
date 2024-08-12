const express = require('express');
const router = express.Router();
const { Events, EventType, EventLocation, EventCategory, EventStatus, User, EventSignUp } = require('../models');
const yup = require("yup");
const { validateToken } = require('../middlewares/auth');
const { Op } = require('sequelize');
const multer = require('multer');
const upload = multer();

// Fetch all event proposals (Sent by Event Organiser)
router.get("/proposals", validateToken, async (req, res) => {
    try {
        console.log('Fetching all event proposals...');
        let list = await Events.findAll({
            order: [['event_date', 'ASC'], ['event_start_time', 'ASC']],
            include: [
                { model: EventType, as: "eventType", attributes: ['event_type_description'] },
                { model: EventLocation, as: "eventLocation", attributes: ['event_location_description'] },
                { model: EventCategory, as: "eventCategory", attributes: ['event_cat_description'] },
                {
                    model: EventStatus, as: "eventStatus", attributes: ['event_status_id', 'description'],
                    where: { event_status_id: 1 } // Ensuring the event status is Pending
                },
                {
                    model: User, as: "user", attributes: ['username', 'user_type_id'],
                    where: { user_type_id: 3 } // Ensuring the user is an Event Organiser
                }
            ],
        });
        console.log(list);
        res.json(list);
    } catch (err) {
        console.error(err);
        res.status(500).json({ errors: err.message });
    }
});

// Fetch a single proposal by ID
router.get("/proposals/:id", validateToken, async (req, res) => {
    const id = req.params.id;
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        console.log(`Fetching event with ID: ${id}`);
        let event = await Events.findOne({
            where: { event_id: id },
            include: [
                { model: EventType, as: "eventType", attributes: ['event_type_description'] },
                { model: EventLocation, as: "eventLocation", attributes: ['event_location_description'] },
                { model: EventCategory, as: "eventCategory", attributes: ['event_cat_description'] },
                { model: EventStatus, as: "eventStatus", attributes: ['description'] },
                { model: User, as: "user", attributes: ['username', 'user_type_id'] }
            ]
        });
        if (!event) {
            return res.status(404).json({ message: `Event with id ${id} not found.` });
        }
        res.json(event);
    } catch (err) {
        console.error(err);
        res.status(500).json({ errors: err.message });
    }
});

// Update an event by Admin
router.put("/proposals/:id", validateToken, async (req, res) => {
    let id = req.params.id;
    const adminUserId = req.user.id;

    try {
        if (!adminUserId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        let event = await Events.findByPk(id);
        if (!event) {
            return res.status(404).json({ message: `Event with id ${id} not found.` });
        }

        let data = req.body;
        let validationSchema = yup.object({
            event_cat_id: yup.number().integer().required(),
            event_type_id: yup.number().integer().required(),
            event_location_id: yup.number().integer().required(),
            reward_id: yup.number().integer().required(),
            event_title: yup.string().trim().min(3).max(100).required(),
            event_description: yup.string().trim().min(3).max(1000).required(),
            event_date: yup.date().required(),
            event_start_time: yup.string().required(),
            event_end_time: yup.string().required(),
            event_status_id: yup.number().integer().required(),
            imageFile: yup.string().trim().max(255).required(),
            signup_limit: yup.number()
                .typeError('Signup limit must be a number')
                .test('is-signup-limit-required', 'Signup limit is required if location is not Online', function (value) {
                    const { event_location_id } = this.parent;
                    return event_location_id === '5' || (value !== undefined && value !== '');
                })
                .positive('Signup limit must be a positive number')
                .integer('Signup limit must be an integer')
                .notRequired(),
        });

        data = await validationSchema.validate(data, { abortEarly: false });

        let num = await Events.update(data, {
            where: { event_id: id }
        });

        if (num == 1) {
            res.json({
                message: "Event was updated successfully."
            });
        } else {
            res.status(400).json({
                message: `Cannot update event with id ${id}.`
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ errors: err.stack }); // Send the full error stack trace for debugging
    }
});

// Fetch all events by Admin
router.get("/event", validateToken, async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const adminUserId = req.user.id;
        const filter = req.query.filter; // Get the filter queryx parameter
        let whereCondition = {
            '$user.user_type_id$': 2,
            '$user.user_id$': adminUserId
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of the day

        if (filter === 'past') {
            whereCondition.event_date = { [Op.lt]: today }; // Past events
        } else if (filter === 'upcoming') {
            whereCondition.event_date = { [Op.gte]: today }; // Upcoming events
        }

        let list = await Events.findAll({
            order: [['event_date', 'ASC'], ['event_start_time', 'ASC']],
            include: [
                { model: EventType, as: "eventType", attributes: ['event_type_description'] },
                { model: EventLocation, as: "eventLocation", attributes: ['event_location_description'] },
                { model: EventCategory, as: "eventCategory", attributes: ['event_cat_description'] },
                { model: EventStatus, as: "eventStatus", attributes: ['description'] },
                {
                    model: User, as: "user", attributes: ['username', 'user_type_id', 'user_id'],
                    where: { user_type_id: 2, user_id: adminUserId } // Ensuring the user is an Admin and the Admin is the one who created the event
                }
            ],
            where: whereCondition,
        });
        res.json(list);
    } catch (err) {
        console.error(err);
        res.status(500).json({ errors: err.message });
    }
});

// Create a new event by Admin
router.post("/event/create", validateToken, async (req, res) => {
    let data = req.body;
    console.log("Received data:", data); // Log the incoming data

    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const adminUserId = req.user.id;

        // Define the validation schema with conditional rules
        const validationSchema = yup.object({
            event_cat_id: yup.number().integer().required(),
            event_type_id: yup.number().integer().required(),
            event_location_id: yup.number().integer().required(),
            reward_id: yup.number().integer().required(),
            event_title: yup.string().trim().min(3).max(100).required(),
            event_description: yup.string().trim().min(3).max(1000).required(),
            event_date: yup.date().required(),
            event_start_time: yup.string().required(),
            event_end_time: yup.string().required(),
            event_status_id: yup.number().integer().required(),
            imageFile: yup.string().trim().max(255).required(),
            signup_limit: yup.number()
                .typeError('Signup limit must be a number')
                .test('is-signup-limit-required', 'Signup limit is required if location is not Online', function (value) {
                    const { event_location_id } = this.parent;
                    return event_location_id === '5' || (value !== undefined && value !== '');
                })
                .positive('Signup limit must be a positive number')
                .integer('Signup limit must be an integer')
                .notRequired(),
        });

        // Validate the data
        data = await validationSchema.validate(data, { abortEarly: false });

        // Add the user ID to the data
        data.user_id = adminUserId;

        // Create the new event in the database
        const result = await Events.create(data);
        res.json(result);
    } catch (err) {
        console.log("Validation errors:", err.errors); // Log validation errors
        res.status(400).json({ errors: err.errors });
    }
});

// Fetch a single event by ID
router.get("/event/:id", validateToken, async (req, res) => {
    const id = req.params.id;
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const adminUserId = req.user.id;
        console.log(`Fetching event with ID: ${id}`);
        let event = await Events.findOne({
            where: { event_id: id, user_id: adminUserId },
            include: [
                { model: EventType, as: "eventType", attributes: ['event_type_description'] },
                { model: EventLocation, as: "eventLocation", attributes: ['event_location_description'] },
                { model: EventCategory, as: "eventCategory", attributes: ['event_cat_description'] },
                { model: EventStatus, as: "eventStatus", attributes: ['description'] },
                { model: User, as: "user", attributes: ['username', 'user_type_id'] }
            ]
        });
        if (!event) {
            return res.status(404).json({ message: `Event with id ${id} not found.` });
        }
        res.json(event);
    } catch (err) {
        console.error(err);
        res.status(500).json({ errors: err.message });
    }
});

// Update an event by Admin
router.put("/event/:id", validateToken, upload.single('imageFile'), async (req, res) => {
    let id = req.params.id;
    const adminUserId = req.user.id;

    try {
        if (!adminUserId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        let event = await Events.findByPk(id);
        if (!event) {
            return res.status(404).json({ message: `Event with id ${id} not found.` });
        }

        let data = req.body;

        // If no new imageFile is uploaded, use the existing one
        if (!req.file) {
            data.imageFile = event.imageFile;
        } else {
            data.imageFile = req.file.path;
        }

        let validationSchema = yup.object({
            event_cat_id: yup.number().integer().required(),
            event_type_id: yup.number().integer().required(),
            event_location_id: yup.number().integer().required(),
            reward_id: yup.number().integer().required(),
            event_title: yup.string().trim().min(3).max(100).required(),
            event_description: yup.string().trim().min(3).max(1000).required(),
            event_date: yup.date().required(),
            event_start_time: yup.string().required(),
            event_end_time: yup.string().required(),
            event_status_id: yup.number().integer().required(),
            imageFile: yup.string().trim().max(255).required(),
            signup_limit: yup.number()
                .typeError('Signup limit must be a number')
                .test('is-signup-limit-required', 'Signup limit is required if location is not Online', function (value) {
                    const { event_location_id } = this.parent;
                    return event_location_id === '5' || (value !== undefined && value !== '');
                })
                .positive('Signup limit must be a positive number')
                .integer('Signup limit must be an integer')
                .notRequired(),
        });

        data = await validationSchema.validate(data, { abortEarly: false });
        data.user_id = adminUserId;

        let num = await Events.update(data, {
            where: { event_id: id, user_id: adminUserId }
        });

        if (num == 1) {
            res.json({
                message: "Event was updated successfully."
            });
        } else {
            res.status(400).json({
                message: `Cannot update event with id ${id}.`
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ errors: err.stack });
    }
});


// Delete an event by Admin
router.delete("/event/:id", validateToken, async (req, res) => {
    let id = req.params.id;
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const adminUserId = req.user.id;
        let event = await Events.findByPk(id);
        if (!event) {
            return res.status(404).json({ message: `Event with id ${id} not found.` });
        }

        let num = await Events.destroy({
            where: { event_id: id, user_id: adminUserId }
        });
        if (num == 1) {
            res.json({
                message: "Event was deleted successfully."
            });
        } else {
            res.status(400).json({
                message: `Cannot delete event with id ${id}.`
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ errors: err.message });
    }
});

// Attendance marking (get)
router.get("/event/:id/attendance", validateToken, async (req, res) => {
    const id = req.params.id;
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        console.log(`Fetching attendance for event with ID: ${id}`);
        let eventSignUps = await EventSignUp.findAll({
            where: { event_id: id },
            include: [
                { model: User, as: "user", attributes: ['username', 'user_type_id', 'phone_no'] },
                { model: Events, as: "events", attributes: ['event_title'] }
            ]
        });
        if (!eventSignUps || eventSignUps.length === 0) {
            console.error(`No sign-ups found for event with id ${id}.`);
            return res.status(404).json({ message: `No sign-ups found for event with id ${id}.` });
        }
        
        // Transform the result to include usernames
        const attendance = eventSignUps.map(signUp => ({
            user_id: signUp.user_id,
            username: signUp.user ? signUp.user.username : 'N/A', // Check if user is defined
            phone_no: signUp.user ? signUp.user.phone_no : 'N/A', // Check if user is defined
            attendance: signUp.attendance,
            event_title: signUp.events ? signUp.events.event_title : 'N/A' // Check if event is defined
        }));

        // Print the attendance to the console
        console.log('Attendance JSON:', JSON.stringify(attendance, null, 2));

        res.json({ attendance });
    } catch (err) {
        console.error(err);
        res.status(500).json({ errors: err.message });
    }
});



// Batch update attendance (put)
router.put("/event/:eventId/attendance", validateToken, async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { eventId } = req.params;
        const { attendanceUpdates } = req.body; // Expecting an array of { userId, attendance } objects

        if (!Array.isArray(attendanceUpdates) || attendanceUpdates.length === 0) {
            return res.status(400).json({ error: 'Invalid attendance updates format or empty array' });
        }

        // Validate attendance values and user IDs
        const validStatuses = ['marked', 'not_marked'];
        const invalidEntries = attendanceUpdates.filter(update => !validStatuses.includes(update.attendance));
        
        if (invalidEntries.length > 0) {
            return res.status(400).json({ error: 'Invalid attendance value in one or more updates' });
        }

        // Update attendance for each user
        await Promise.all(attendanceUpdates.map(async ({ userId, attendance }) => {
            const eventSignUp = await EventSignUp.findOne({
                where: { event_id: eventId, user_id: userId }
            });

            if (eventSignUp) {
                eventSignUp.attendance = attendance;
                await eventSignUp.save();
            }
        }));

        res.json({ message: 'Attendance updated successfully for multiple users' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ errors: err.message });
    }
});

module.exports = router;
