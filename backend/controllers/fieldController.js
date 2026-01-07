const Field = require('../models/Field');
const { memoryStore, isDemoMode } = require('../utils/memoryStore');
const { validationResult } = require('express-validator');

// @desc    Get all fields
// @route   GET /api/fields
// @access  Public
exports.getFields = async (req, res) => {
    try {
        const { category, search } = req.query;

        if (isDemoMode()) {
            let results = memoryStore.fields;

            if (category && category !== 'all') {
                results = results.filter(f => f.category === category);
            }

            if (search) {
                const searchLower = search.toLowerCase();
                results = results.filter(f =>
                    f.name.toLowerCase().includes(searchLower) ||
                    f.description.toLowerCase().includes(searchLower)
                );
            }

            return res.json({
                success: true,
                count: results.length,
                data: results
            });
        }

        // MongoDB
        let query = {};

        if (category && category !== 'all') {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const fields = await Field.find(query).sort({ name: 1 });

        res.json({
            success: true,
            count: fields.length,
            data: fields
        });
    } catch (error) {
        console.error('Get fields error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get field by ID
// @route   GET /api/fields/:id
// @access  Public
exports.getFieldById = async (req, res) => {
    try {
        const id = req.params.id;

        if (isDemoMode()) {
            const numericId = parseInt(id);
            const field = memoryStore.fields.find(f => f.id === numericId || f.id == id);

            if (!field) {
                return res.status(404).json({ success: false, error: 'Field not found' });
            }

            return res.json({ success: true, data: field });
        }

        let field;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            field = await Field.findById(id);
        } else {
            field = await Field.findOne({ id: id });
        }

        if (!field) {
            return res.status(404).json({ success: false, error: 'Field not found' });
        }

        res.json({ success: true, data: field });
    } catch (error) {
        console.error('Get field error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Create field
// @route   POST /api/fields
// @access  Private/Admin
exports.createField = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        if (isDemoMode()) {
            const newField = {
                id: Date.now(),
                ...req.body,
                createdAt: new Date().toISOString()
            };
            memoryStore.fields.push(newField);
            return res.status(201).json({ success: true, data: newField });
        }

        const fieldData = {
            ...req.body,
            id: Date.now()
        };
        const field = await Field.create(fieldData);
        res.status(201).json({ success: true, data: field });
    } catch (error) {
        console.error('Create field error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Update field
// @route   PUT /api/fields/:id
// @access  Private/Admin
exports.updateField = async (req, res) => {
    try {
        const id = req.params.id;

        if (isDemoMode()) {
            const numericId = parseInt(id);
            const index = memoryStore.fields.findIndex(f => f.id === numericId || f.id == id);

            if (index === -1) {
                return res.status(404).json({ success: false, error: 'Field not found' });
            }

            memoryStore.fields[index] = {
                ...memoryStore.fields[index],
                ...req.body
            };

            return res.json({ success: true, data: memoryStore.fields[index] });
        }

        let field;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            field = await Field.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        } else {
            field = await Field.findOneAndUpdate({ id: id }, req.body, { new: true, runValidators: true });
        }

        if (!field) {
            return res.status(404).json({ success: false, error: 'Field not found' });
        }

        res.json({ success: true, data: field });
    } catch (error) {
        console.error('Update field error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Delete field
// @route   DELETE /api/fields/:id
// @access  Private/Admin
exports.deleteField = async (req, res) => {
    try {
        const id = req.params.id;

        if (isDemoMode()) {
            const numericId = parseInt(id);
            const index = memoryStore.fields.findIndex(f => f.id === numericId || f.id == id);

            if (index === -1) {
                return res.status(404).json({ success: false, error: 'Field not found' });
            }

            memoryStore.fields.splice(index, 1);
            return res.json({ success: true, data: {} });
        }

        let field;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            field = await Field.findByIdAndDelete(id);
        } else {
            field = await Field.findOneAndDelete({ id: id });
        }

        if (!field) {
            return res.status(404).json({ success: false, error: 'Field not found' });
        }

        res.json({ success: true, data: {} });
    } catch (error) {
        console.error('Delete field error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
