const Mentor = require('../models/Mentor');
const { memoryStore, isDemoMode } = require('../utils/memoryStore');
const { validationResult } = require('express-validator');

// @desc    Get all mentors
// @route   GET /api/mentors
// @access  Public
exports.getMentors = async (req, res) => {
    try {
        const { field, experience, search } = req.query;

        if (isDemoMode()) {
            let results = memoryStore.mentors.filter(m => m.status === 'verified');

            if (field && field !== 'all') {
                results = results.filter(m => m.field === field);
            }
            if (experience && experience !== 'all') {
                results = results.filter(m => m.experience === experience);
            }
            if (search) {
                const searchLower = search.toLowerCase();
                results = results.filter(m =>
                    m.name.toLowerCase().includes(searchLower) ||
                    m.title.toLowerCase().includes(searchLower) ||
                    m.company.toLowerCase().includes(searchLower)
                );
            }

            return res.json({
                success: true,
                count: results.length,
                data: results
            });
        }

        // MongoDB
        let query = { status: 'verified' };

        if (field && field !== 'all') {
            query.field = field;
        }

        if (experience && experience !== 'all') {
            query.experience = experience;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { title: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } }
            ];
        }

        const mentors = await Mentor.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: mentors.length,
            data: mentors
        });
    } catch (error) {
        console.error('Get mentors error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get all mentors (Admin - includes unverified)
// @route   GET /api/admin/mentors
// @access  Private/Admin
exports.getAdminMentors = async (req, res) => {
    try {
        if (isDemoMode()) {
            return res.json({
                success: true,
                count: memoryStore.mentors.length,
                data: memoryStore.mentors
            });
        }

        const mentors = await Mentor.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            count: mentors.length,
            data: mentors
        });
    } catch (error) {
        console.error('Get admin mentors error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get mentor by ID
// @route   GET /api/mentors/:id
// @access  Public
exports.getMentorById = async (req, res) => {
    try {
        const id = req.params.id;

        if (isDemoMode()) {
            const numericId = parseInt(id);
            const mentor = memoryStore.mentors.find(m => m.id === numericId || m.id == id);

            if (!mentor) {
                return res.status(404).json({ success: false, error: 'Mentor not found' });
            }

            return res.json({ success: true, data: mentor });
        }

        let mentor;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            mentor = await Mentor.findById(id);
        } else {
            mentor = await Mentor.findOne({ id: id });
        }

        if (!mentor) {
            return res.status(404).json({ success: false, error: 'Mentor not found' });
        }

        res.json({ success: true, data: mentor });
    } catch (error) {
        console.error('Get mentor error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Create mentor
// @route   POST /api/mentors
// @access  Private/Admin
exports.createMentor = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        if (isDemoMode()) {
            const newMentor = {
                id: Date.now(),
                ...req.body,
                status: req.body.status || 'pending',
                rating: 0,
                mentees: 0,
                createdAt: new Date().toISOString()
            };
            memoryStore.mentors.push(newMentor);
            return res.status(201).json({ success: true, data: newMentor });
        }

        // MongoDB
        const mentorData = {
            ...req.body,
            id: Date.now()
        };
        const mentor = await Mentor.create(mentorData);
        res.status(201).json({ success: true, data: mentor });
    } catch (error) {
        console.error('Create mentor error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Update mentor
// @route   PUT /api/mentors/:id
// @access  Private/Admin
exports.updateMentor = async (req, res) => {
    try {
        const id = req.params.id;

        if (isDemoMode()) {
            const numericId = parseInt(id);
            const index = memoryStore.mentors.findIndex(m => m.id === numericId || m.id == id);

            if (index === -1) {
                return res.status(404).json({ success: false, error: 'Mentor not found' });
            }

            memoryStore.mentors[index] = {
                ...memoryStore.mentors[index],
                ...req.body,
                updatedAt: new Date().toISOString()
            };

            return res.json({ success: true, data: memoryStore.mentors[index] });
        }

        let mentor;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            mentor = await Mentor.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        } else {
            mentor = await Mentor.findOneAndUpdate({ id: id }, req.body, { new: true, runValidators: true });
        }

        if (!mentor) {
            return res.status(404).json({ success: false, error: 'Mentor not found' });
        }

        res.json({ success: true, data: mentor });
    } catch (error) {
        console.error('Update mentor error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Delete mentor
// @route   DELETE /api/mentors/:id
// @access  Private/Admin
exports.deleteMentor = async (req, res) => {
    try {
        const id = req.params.id;

        if (isDemoMode()) {
            const numericId = parseInt(id);
            const index = memoryStore.mentors.findIndex(m => m.id === numericId || m.id == id);

            if (index === -1) {
                return res.status(404).json({ success: false, error: 'Mentor not found' });
            }

            memoryStore.mentors.splice(index, 1);
            return res.json({ success: true, data: {} });
        }

        let mentor;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            mentor = await Mentor.findByIdAndDelete(id);
        } else {
            mentor = await Mentor.findOneAndDelete({ id: id });
        }

        if (!mentor) {
            return res.status(404).json({ success: false, error: 'Mentor not found' });
        }

        res.json({ success: true, data: {} });
    } catch (error) {
        console.error('Delete mentor error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
