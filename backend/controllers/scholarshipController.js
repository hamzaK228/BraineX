const Scholarship = require('../models/Scholarship');
const { memoryStore, isDemoMode } = require('../utils/memoryStore');
const { validationResult } = require('express-validator');

// @desc    Get all scholarships
// @route   GET /api/scholarships
// @access  Public
exports.getScholarships = async (req, res) => {
    try {
        const { category, field, country, search } = req.query;

        if (isDemoMode()) {
            let results = memoryStore.scholarships.filter(s => s.status === 'active');

            if (category && category !== 'all') {
                results = results.filter(s => s.category === category);
            }
            if (field && field !== 'all') {
                results = results.filter(s =>
                    s.tags && s.tags.some(t => t.toLowerCase().includes(field.toLowerCase())) ||
                    (s.field && s.field.toLowerCase().includes(field.toLowerCase()))
                );
            }
            if (country && country !== 'all') {
                results = results.filter(s => s.country.toLowerCase() === country.toLowerCase());
            }
            if (search) {
                const searchLower = search.toLowerCase();
                results = results.filter(s =>
                    s.name.toLowerCase().includes(searchLower) ||
                    s.organization.toLowerCase().includes(searchLower) ||
                    s.description.toLowerCase().includes(searchLower)
                );
            }

            return res.json({
                success: true,
                count: results.length,
                data: results
            });
        }

        // MongoDB Query
        let query = { status: 'active' };

        if (category && category !== 'all') {
            query.category = category;
        }

        if (field && field !== 'all') {
            // Check if field acts as a tag filter or a specific field property if added later
            // For now, check tags or if we added a field property to schema (current schema doesn't have 'field' explicitly other than tags context or category)
            // The service checked 'field' property but schema I created relies on tags or text.
            // Let's assume we filter tags for now or check description
            query.tags = { $regex: field, $options: 'i' };
        }

        if (country && country !== 'all') {
            query.country = { $regex: new RegExp(`^${country}$`, 'i') };
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { organization: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const scholarships = await Scholarship.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: scholarships.length,
            data: scholarships
        });
    } catch (error) {
        console.error('Get scholarships error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get all scholarships (Admin - includes inactive)
// @route   GET /api/admin/scholarships
// @access  Private/Admin
exports.getAdminScholarships = async (req, res) => {
    try {
        if (isDemoMode()) {
            return res.json({
                success: true,
                count: memoryStore.scholarships.length,
                data: memoryStore.scholarships
            });
        }

        const scholarships = await Scholarship.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            count: scholarships.length,
            data: scholarships
        });
    } catch (error) {
        console.error('Get admin scholarships error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get scholarship by ID
// @route   GET /api/scholarships/:id
// @access  Public
exports.getScholarshipById = async (req, res) => {
    try {
        const id = req.params.id;

        if (isDemoMode()) {
            // Try to parse ID as number for demo data
            const numericId = parseInt(id);
            const scholarship = memoryStore.scholarships.find(s => s.id === numericId || s.id == id);

            if (!scholarship) {
                return res.status(404).json({ success: false, error: 'Scholarship not found' });
            }

            return res.json({ success: true, data: scholarship });
        }

        let scholarship;

        // Check if ID is a valid ObjectId for Mongo
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            scholarship = await Scholarship.findById(id);
        } else {
            // Fallback for numeric IDs if we imported seeded data
            scholarship = await Scholarship.findOne({ id: id });
        }

        if (!scholarship) {
            return res.status(404).json({ success: false, error: 'Scholarship not found' });
        }

        res.json({ success: true, data: scholarship });
    } catch (error) {
        console.error('Get scholarship error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Create scholarship
// @route   POST /api/scholarships
// @access  Private/Admin
exports.createScholarship = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        if (isDemoMode()) {
            const newScholarship = {
                id: Date.now(), // Generate numeric ID
                ...req.body,
                status: req.body.status || 'active',
                createdAt: new Date().toISOString()
            };
            memoryStore.scholarships.push(newScholarship);
            return res.status(201).json({ success: true, data: newScholarship });
        }

        // MongoDB
        // Logic to generate numeric ID if we want to keep it? 
        // Or just let Mongo use _id. 
        // For consistency let's try to add a numeric id if possible, or just rely on the model default (which I set to unique false/true but no auto-increment).
        // I'll just save it. If the client sends an ID, use it, else let it be null or handle it.
        // Actually, schema has `id: { type: Number, unique: true }`. If I don't give it, it might be null.
        // Let's generate one to be safe.

        const scholarshipData = {
            ...req.body,
            id: Date.now() // Simple unique ID generator
        };

        const scholarship = await Scholarship.create(scholarshipData);
        res.status(201).json({ success: true, data: scholarship });
    } catch (error) {
        console.error('Create scholarship error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Update scholarship
// @route   PUT /api/scholarships/:id
// @access  Private/Admin
exports.updateScholarship = async (req, res) => {
    try {
        const id = req.params.id;

        if (isDemoMode()) {
            const numericId = parseInt(id);
            const index = memoryStore.scholarships.findIndex(s => s.id === numericId || s.id == id);

            if (index === -1) {
                return res.status(404).json({ success: false, error: 'Scholarship not found' });
            }

            memoryStore.scholarships[index] = {
                ...memoryStore.scholarships[index],
                ...req.body,
                updatedAt: new Date().toISOString()
            };

            return res.json({ success: true, data: memoryStore.scholarships[index] });
        }

        let scholarship;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            scholarship = await Scholarship.findByIdAndUpdate(id, req.body, {
                new: true,
                runValidators: true
            });
        } else {
            scholarship = await Scholarship.findOneAndUpdate({ id: id }, req.body, {
                new: true,
                runValidators: true
            });
        }

        if (!scholarship) {
            return res.status(404).json({ success: false, error: 'Scholarship not found' });
        }

        res.json({ success: true, data: scholarship });
    } catch (error) {
        console.error('Update scholarship error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Delete scholarship
// @route   DELETE /api/scholarships/:id
// @access  Private/Admin
exports.deleteScholarship = async (req, res) => {
    try {
        const id = req.params.id;

        if (isDemoMode()) {
            const numericId = parseInt(id);
            const index = memoryStore.scholarships.findIndex(s => s.id === numericId || s.id == id);

            if (index === -1) {
                return res.status(404).json({ success: false, error: 'Scholarship not found' });
            }

            memoryStore.scholarships.splice(index, 1);
            return res.json({ success: true, data: {} });
        }

        let scholarship;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            scholarship = await Scholarship.findByIdAndDelete(id);
        } else {
            scholarship = await Scholarship.findOneAndDelete({ id: id });
        }

        if (!scholarship) {
            return res.status(404).json({ success: false, error: 'Scholarship not found' });
        }

        res.json({ success: true, data: {} });
    } catch (error) {
        console.error('Delete scholarship error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
