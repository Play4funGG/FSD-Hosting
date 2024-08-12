const express = require('express');
const router = express.Router();
const { Events, EventType, EventLocation, EventCategory, EventStatus, User, EventSignUp } = require('../models');
const yup = require("yup");
const { validateToken } = require('../middlewares/auth');
const { Op } = require('sequelize');
const multer = require('multer');
const upload = multer();

// Fetch all event proposals (Sent by Event Organiser)
router.get("/proposal", validateToken, async (req, res) => {
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
                    where: { event_status_id: { [Op.in]: [1, 2] } } // Correct way to filter for event status IDs 1 and 2
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

// Create a new proposal by Organiser
router.post("/proposal/create", validateToken, async (req, res) => {
    let data = req.body;
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const organiserUserId = req.user.id;
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
                .integer('Signup limit must be an integer'),
        });
        data = await validationSchema.validate(data, { abortEarly: false });
        data.user_id = organiserUserId;
        let result = await Events.create(data);
        res.json(result);
    } catch (err) {
        console.log(err);
        res.status(400).json({ errors: err.errors });
    }
});

// Fetch a single proposal by ID
router.get("/proposal/:id", validateToken, async (req, res) => {
    const id = req.params.id;
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const organiserUserId = req.user.id;
        console.log(`Fetching event with ID: ${id}`);
        let event = await Events.findOne({
            where: { event_id: id, user_id: organiserUserId },
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

// Fetch all approved events by Event Organisers
router.get("/event", validateToken, async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const organiserUserId = req.user.id;
        const filter = req.query.filter; // Get the filter query parameter

        // Base where condition for events
        let whereCondition = {
            '$user.user_type_id$': 3,
            '$user.user_id$': organiserUserId,
            event_status_id: 3 // Ensuring the event is approved
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
                    where: { user_type_id: 3, user_id: organiserUserId } // Ensuring the user is an Organiser
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

// Fetch a single event by ID
router.get("/event/:id", validateToken, async (req, res) => {
    const id = req.params.id;
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const organiserUserId = req.user.id;
        console.log(`Fetching event with ID: ${id}`);
        let event = await Events.findOne({
            where: { event_id: id, user_id: organiserUserId },
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

// Update an event by Organiser
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
                .integer('Signup limit must be an integer'),
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

// Delete an event by Organiser
router.delete("/event/:id", validateToken, async (req, res) => {
    let id = req.params.id;
    const organiserUserId = req.user.id;
    try {
        if (!organiserUserId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        let result = await Events.destroy({
            where: { event_id: id, user_id: organiserUserId }
        });

        if (result === 1) {
            res.json({
                message: `Event with id ${id} was deleted successfully.`
            });
        } else {
            res.status(404).json({
                message: `Event with id ${id} not found.`
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ errors: err.message });
    }
});

// Manage attendance for an event
router.put("/event/:eventId/attendance", validateToken, async (req, res) => {
    const eventId = req.params.eventId;
    const updates = req.body;
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const organiserUserId = req.user.id;

        // Ensure that the event exists and belongs to the organizer
        let event = await Events.findOne({ where: { event_id: eventId, user_id: organiserUserId } });
        if (!event) {
            return res.status(404).json({ message: `Event with id ${eventId} not found.` });
        }

        // Batch update of attendance
        let attendanceUpdates = updates.map(update => ({
            ...update,
            event_id: eventId
        }));

        let result = await EventSignUp.bulkCreate(attendanceUpdates, {
            updateOnDuplicate: ['status', 'attendance'] // Only update status and attendance fields
        });

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ errors: err.message });
    }
});

module.exports = router;
