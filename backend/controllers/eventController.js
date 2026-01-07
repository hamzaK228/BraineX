const Event = require('../models/Event');
const memoryStore = require('../utils/memoryStore');
const mongoose = require('mongoose');

const isMongoConnected = () => mongoose.connection.readyState === 1;

exports.getEvents = async (req, res) => {
    try {
        const { type, status, search } = req.query;
        let events = [];

        if (isMongoConnected()) {
            let query = {};
            if (type) query.type = type;
            if (status) query.status = status;
            if (search) {
                query.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }
            events = await Event.find(query).sort({ date: 1 });
        } else {
            // Memory Store Fallback
            events = memoryStore.events;
            if (type) events = events.filter(e => e.type === type);
            if (status) events = events.filter(e => e.status === status);
            if (search) {
                const s = search.toLowerCase();
                events = events.filter(e =>
                    e.title.toLowerCase().includes(s) ||
                    e.description.toLowerCase().includes(s)
                );
            }
            // Simple sort by date
            events.sort((a, b) => new Date(a.date) - new Date(b.date));
        }

        res.json({ success: true, count: events.length, data: events });
    } catch (error) {
        console.error('Get Events Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        let event = null;

        if (isMongoConnected()) {
            if (mongoose.Types.ObjectId.isValid(id)) {
                event = await Event.findById(id);
            }
        } else {
            event = memoryStore.events.find(e => e._id === id || e.id === id);
        }

        if (!event) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }

        res.json({ success: true, data: event });
    } catch (error) {
        console.error('Get Event Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.createEvent = async (req, res) => {
    // Only Admin
    try {
        if (isMongoConnected()) {
            const event = await Event.create(req.body);
            return res.status(201).json({ success: true, data: event });
        } else {
            const newEvent = {
                _id: Date.now().toString(),
                ...req.body,
                createdAt: new Date()
            };
            memoryStore.events.push(newEvent);
            return res.status(201).json({ success: true, data: newEvent });
        }
    } catch (error) {
        console.error('Create Event Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        if (isMongoConnected()) {
            if (mongoose.Types.ObjectId.isValid(id)) {
                await Event.findByIdAndDelete(id);
                return res.json({ success: true, data: {} });
            }
        } else {
            memoryStore.events = memoryStore.events.filter(e => e._id !== id && e.id !== id);
            return res.json({ success: true, data: {} });
        }
        return res.status(404).json({ success: false, error: 'Event not found' });
    } catch (error) {
        console.error('Delete Event Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
