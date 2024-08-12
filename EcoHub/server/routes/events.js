const express = require('express');
const router = express.Router();
const { EventType, Events, EventLocation, EventCategory, EventSignUp } = require('../models');
const { Op } = require("sequelize");
const yup = require("yup");
const { validateToken } = require('../middlewares/auth');
const eventSignup = require('../models/eventSignup');

// terrence part
router.get("/", async (req, res) => {
    let condition = {
        event_status_id: 3 // Assuming '3' represents active events
    };
    const now = new Date();
    let upcomingCondition = {
       ...condition,
        event_date: {
            [Op.gt]: now
        }
    };
    let pastCondition = {
       ...condition,
        event_date: {
            [Op.lte]: now
        }
    };

    let upcomingEvents = await Events.findAll({
        where: upcomingCondition,
        order: [['event_date', 'ASC'], ['event_start_time', 'ASC'], ['event_end_time', 'ASC']],
        limit: 3,
        include: [
            { model: EventType, as: "eventType", attributes: ['event_type_description'] },
            { model: EventLocation, as: "eventLocation", attributes: ['event_location_description'] },
            { model: EventCategory, as: "eventCategory", attributes: ['event_cat_description'] }
        ]
    });

    let pastEvents = await Events.findAll({
        where: pastCondition,
        order: [['event_date', 'DESC'], ['event_start_time', 'DESC'], ['event_end_time', 'DESC']],
        limit: 3,
        include: [
            { model: EventType, as: "eventType", attributes: ['event_type_description'] },
            { model: EventLocation, as: "eventLocation", attributes: ['event_location_description'] },
            { model: EventCategory, as: "eventCategory", attributes: ['event_cat_description'] }
        ]
    });

    res.json({ upcomingEvents, pastEvents });
});

// terrence part
router.get("/upcoming/:id", async (req, res) => {
    const pageNumber = parseInt(req.params.id) || 1; // Default to page 1 if no page number is provided
    const pageSize = 10; // Number of items per page
    const now = new Date();
    const search = req.query.search;
    const category = req.query.category;
    const type = req.query.type;

    let condition = {
        event_status_id: 3, // Show active events
        event_date: {
            [Op.gt]: now // Filter events that are after the current date
        }
    };

    if (search) {
        condition[Op.or] = [
            { event_title: { [Op.like]: `%${search}%` } },
            { event_description: { [Op.like]: `%${search}%` } }
        ];
    }
    
    if (category) {
        condition.event_cat_id = category;
    }

    if (type) {
        condition.event_type_id = type;
    }

    let list = await Events.findAndCountAll({
        where: condition,
        order: [['event_date', 'ASC'], ['event_start_time', 'ASC'], ['event_end_time', 'ASC']],
        offset: (pageNumber - 1) * pageSize, // Calculate offset based on page number
        limit: pageSize, // Limit the number of results per page
        include: [
            { model: EventType, as: "eventType", attributes: ['event_type_description'] },
            { model: EventLocation, as: "eventLocation", attributes: ['event_location_description'] },
            { model: EventCategory, as: "eventCategory", attributes: ['event_cat_description'] }
        ]
    });

    const totalPages = Math.ceil(list.count / pageSize); // Calculate total number of pages

    res.json({
        events: list.rows,
        currentPage: pageNumber,
        totalPages: totalPages
    });
});

// terrence part
router.get("/past/:id", async (req, res) => {
    const pageNumber = parseInt(req.params.id) || 1; // Default to page 1 if no page number is provided
    const pageSize = 10; // Number of items per page
    const now = new Date();
    const search = req.query.search;
    const category = req.query.category;
    const type = req.query.type;

    let condition = {
        event_status_id: 3, // Show active events
        event_date: {
            [Op.lt]: now // Filter events that are before the current date
        }
    };

    if (search) {
        condition[Op.or] = [
            { event_title: { [Op.like]: `%${search}%` } },
            { event_description: { [Op.like]: `%${search}%` } }
        ];
    }

    if (category) {
        condition.event_cat_id = category;
    }

    if (type) {
        condition.event_type_id = type;
    }

    let list = await Events.findAndCountAll({
        where: condition,
        order: [['event_date', 'DESC'], ['event_start_time', 'DESC'], ['event_end_time', 'DESC']],
        offset: (pageNumber - 1) * pageSize, // Calculate offset based on page number
        limit: pageSize, // Limit the number of results per page
        include: [
            { model: EventType, as: "eventType", attributes: ['event_type_description'] },
            { model: EventLocation, as: "eventLocation", attributes: ['event_location_description'] },
            { model: EventCategory, as: "eventCategory", attributes: ['event_cat_description'] }
        ]
    });

    const totalPages = Math.ceil(list.count / pageSize); // Calculate total number of pages

    res.json({
        events: list.rows,
        currentPage: pageNumber,
        totalPages: totalPages
    });
});


// terrence part
router.get("/details/:id", async (req, res) => {
    const eventId = req.params.id;
    const event = await Events.findByPk(eventId, {
        include: [
            { model: EventType, as: "eventType", attributes: ['event_type_description'] },
            { model: EventLocation, as: "eventLocation", attributes: ['event_location_description'] },
            { model: EventCategory, as: "eventCategory", attributes: ['event_cat_description'] }
        ]
    });

    if (!event) {
        return res.status(404).json({ error: 'Event not found' });  
    }
    res.json(event);
    
});

router.get("/sorting/:id", async (req, res) => {
    const pageNumber = parseInt(req.params.id) || 1; // Default to page 1 if no page number is provided
    const pageSize = 10; // Number of items per page
    const search = req.query.search;
    const category = req.query.category;
    const type = req.query.type;

    let condition = {
        event_status_id: 3, // Show active events
    };

    if (search) {
        condition[Op.or] = [
            { event_title: { [Op.like]: `%${search}%` } },
            { event_description: { [Op.like]: `%${search}%` } }
        ];
    }

    if (category) {
        condition.event_cat_id = category;
    }

    if (type) {
        condition.event_type_id = type;
    }

    let list = await Events.findAndCountAll({
        where: condition,
        order: [['event_date', 'ASC'], ['event_start_time', 'ASC'], ['event_end_time', 'ASC']],
        offset: (pageNumber - 1) * pageSize, // Calculate offset based on page number
        limit: pageSize, // Limit the number of results per page
        include: [
            { model: EventType, as: "eventType", attributes: ['event_type_description'] },
            { model: EventLocation, as: "eventLocation", attributes: ['event_location_description'] },
            { model: EventCategory, as: "eventCategory", attributes: ['event_cat_description'] }
        ]
    });

    const totalPages = Math.ceil(list.count / pageSize); // Calculate total number of pages

    res.json({
        events: list.rows,
        currentPage: pageNumber,
        totalPages: totalPages
    });
});

// Endpoint to get all event categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await EventCategory.findAll({
            attributes: ['event_cat_id', 'event_cat_description']
        });
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send('Server Error');
    }
});

// Endpoint to get all event categories
router.get('/type', async (req, res) => {
    try {
        const type = await EventType.findAll({
            attributes: ['event_type_id', 'event_type_description']
        });
        res.json(type);
    } catch (error) {
        console.error('Error fetching type:', error);
        res.status(500).send('Server Error');
    }
});

router.get('/check-signup', async (req, res) => {
    const { userId, eventId } = req.query;
    console.log(`Checking signup status for userId: ${userId}, eventId: ${eventId}`); // Log incoming request details
    try {
        const signUpExists = await EventSignUp.findOne({
            where: {
                user_id: userId,
                event_id: eventId
            }
        });
        const hasSignedUp = signUpExists ? true : false;
        console.log(`Signup status for userId: ${userId}, eventId: ${eventId} is ${hasSignedUp}`); // Log determined signup status
        res.json({ hasSignedUp });
    } catch (error) {
        console.error('Error checking signup status:', error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get('/all-user-signup', async (req, res) => {
    const { userId } = req.query;
    console.log(`Fetching all signups for userId: ${userId}`); // Log incoming request details
    try {
        const userSignUps = await EventSignUp.findAll({
            where: {
                user_id: userId
            },
            include: [
                {
                    model: Events,
                    as: 'events', // Correct alias for the association
                    attributes: ['event_id', 'event_title', 'event_date', 'event_start_time', 'event_end_time', 'imageFile'] // Include additional fields
                }
            ]
        });
        console.log(`Found ${userSignUps.length} signups for userId: ${userId}`); // Log determined signup count
        res.json(userSignUps);
    } catch (error) {
        console.error('Error fetching user signups:', error);
        res.status(500).json({ message: "Server error" });
    }
});



router.post('/signup', async (req, res) => {
    try {
        const {userId, eventId} = req.body;
        console.log("Received signup request:", req.body); // Log the request body
        // Simplify or mock the database operation for testing
        const signUp = await EventSignUp.create({
            user_id: userId,
            event_id: eventId,
            SignUpDate: new Date(),
            status: 'registered'
        });
        console.log("signup data:", signUp); // Log the mocked data
        res.json(signUp);
    } catch (error) {
        console.error("Signup error:", error); // Enhanced error logging
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.delete('/withdraw', async (req, res) => {
    try {
        const { userId, eventId } = req.query;
        console.log("Received withdraw request:", req.query); // Log the request query
        // Simplify or mock the database operation for testing
        const signUp = await EventSignUp.destroy({
            where: {
                user_id: userId,
                event_id: eventId
            }
        });
        console.log("withdraw data:", signUp); // Log the mocked data
        res.json({ message: "Withdraw successful" });
    } catch (error) {
        console.error("Withdraw error:", error); // Enhanced error logging
        res.status(500).json({ message: "Server error", error: error.message });
    }   
});

router.get('/similar-events/:eventId', async (req, res) => {
    const eventId = req.params.eventId;

    try {
        // Find the current event
        const currentEvent = await Events.findOne({ where: { event_id: eventId } });
        if (!currentEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const currentEventCategory = currentEvent.event_cat_id;

        // Step 2: Find events in the same category as the current event, excluding the current event itself
        const similarEventsInSameCategory = await Events.findAll({
            where: {
                event_cat_id: currentEventCategory,
                event_id: {
                    [Op.ne]: eventId // Exclude the current event
                },
                event_date: {
                    [Op.gte]: new Date()
                }
            },
            order: [
                ['event_date', 'ASC'],
                ['event_start_time', 'ASC']
            ],
            limit: 3,
            include: [
                { model: EventType, as: "eventType", attributes: ['event_type_description'] },
                { model: EventLocation, as: "eventLocation", attributes: ['event_location_description'] },
                { model: EventCategory, as: "eventCategory", attributes: ['event_cat_description'] }
            ]
        });

        // Step 4: Fetch events from other categories
        const otherCategories = await EventCategory.findAll({
            where: {
                event_cat_id: {
                    [Op.ne]: currentEventCategory
                }
            }
        });

        let similarEventsFromOtherCategories = [];
        for (const category of otherCategories) {
            const events = await Events.findAll({
                where: {
                    event_cat_id: category.event_cat_id,
                    event_date: {
                        [Op.gte]: new Date()
                    }
                },
                order: [
                    ['event_date', 'ASC'],
                    ['event_start_time', 'ASC']
                ],
                limit: 1, // Adjusted to ensure total does not exceed 3
                include: [
                    { model: EventType, as: "eventType", attributes: ['event_type_description'] },
                    { model: EventLocation, as: "eventLocation", attributes: ['event_location_description'] },
                    { model: EventCategory, as: "eventCategory", attributes: ['event_cat_description'] }
                ]
            });
            similarEventsFromOtherCategories.push(...events);
            if (similarEventsFromOtherCategories.length >= 3) break; // Ensure we don't fetch more than needed
        }

        // Combine similar events from the same category and other categories
        const combinedSimilarEvents = [...similarEventsInSameCategory, ...similarEventsFromOtherCategories];
        res.json(combinedSimilarEvents.slice(0, 3)); // Ensure only 3 events are returned
    } catch (error) {
        console.error('Error fetching similar events:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});




module.exports = router;
