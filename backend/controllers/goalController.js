const Goal = require('../models/Goal');
const inMemoryStore = require('../services/inMemoryStore');
const { isMongooseConnected } = require('../config/database');

// Get all items (goals, tasks, notes)
exports.getItems = async (req, res) => {
    try {
        const { type } = req.query;
        const query = { user: req.user._id };
        if (type) query.type = type;

        if (isMongooseConnected()) {
            const items = await Goal.find(query).sort({ createdAt: -1 });
            res.json({ success: true, count: items.length, data: items });
        } else {
            // In-memory fallback
            const items = inMemoryStore.findAll('goals', { user: req.user._id });
            const filtered = type ? items.filter(i => i.type === type) : items;
            res.json({ success: true, count: filtered.length, data: filtered });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Create new item
exports.createItem = async (req, res) => {
    try {
        const { title, type, description, dueDate, priority, status } = req.body;

        if (isMongooseConnected()) {
            const item = await Goal.create({
                user: req.user._id,
                title,
                type: type || 'goal',
                description,
                dueDate,
                priority,
                status
            });
            res.status(201).json({ success: true, data: item });
        } else {
            const item = inMemoryStore.create('goals', {
                user: req.user._id,
                title,
                type: type || 'goal',
                description,
                dueDate,
                priority,
                status: status || 'pending',
                createdAt: new Date().toISOString()
            });
            res.status(201).json({ success: true, data: item });
        }
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Update item
exports.updateItem = async (req, res) => {
    try {
        if (isMongooseConnected()) {
            const item = await Goal.findOneAndUpdate(
                { _id: req.params.id, user: req.user._id },
                req.body,
                { new: true, runValidators: true }
            );
            if (!item) return res.status(404).json({ success: false, error: 'Item not found' });
            res.json({ success: true, data: item });
        } else {
            const item = inMemoryStore.update('goals', req.params.id, req.body);
            if (!item) return res.status(404).json({ success: false, error: 'Item not found' });
            res.json({ success: true, data: item });
        }
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Delete item
exports.deleteItem = async (req, res) => {
    try {
        if (isMongooseConnected()) {
            const item = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
            if (!item) return res.status(404).json({ success: false, error: 'Item not found' });
            res.json({ success: true, data: {} });
        } else {
            const success = inMemoryStore.delete('goals', req.params.id);
            if (!success) return res.status(404).json({ success: false, error: 'Item not found' });
            res.json({ success: true, data: {} });
        }
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
