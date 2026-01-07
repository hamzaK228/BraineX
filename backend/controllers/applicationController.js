const Application = require('../models/Application');
const memoryStore = require('../utils/memoryStore');
const mongoose = require('mongoose');

const isMongoConnected = () => mongoose.connection.readyState === 1;

exports.createApplication = async (req, res) => {
    try {
        const { scholarshipId, mentorId, type, data } = req.body;
        const userId = req.user.id; // From auth middleware

        if (isMongoConnected()) {
            // Check for existing
            const query = { userId, type };
            if (scholarshipId) query.scholarshipId = scholarshipId;
            if (mentorId) query.mentorId = mentorId;

            const existing = await Application.findOne(query);
            if (existing) {
                return res.status(400).json({ success: false, error: 'You have already applied.' });
            }

            const application = await Application.create({
                userId,
                scholarshipId,
                mentorId,
                type,
                data
            });
            return res.status(201).json({ success: true, data: application });
        } else {
            // Memory Store
            const existing = memoryStore.applications.find(a =>
                (a.userId === userId || a.userId === req.user._id) &&
                a.type === type &&
                (scholarshipId ? a.scholarshipId === scholarshipId : true) &&
                (mentorId ? a.mentorId === mentorId : true)
            );

            if (existing) {
                return res.status(400).json({ success: false, error: 'You have already applied.' });
            }

            const newApp = {
                _id: Date.now().toString(),
                userId,
                scholarshipId,
                mentorId,
                type,
                data,
                status: 'pending',
                submittedAt: new Date()
            };
            memoryStore.applications.push(newApp);
            return res.status(201).json({ success: true, data: newApp });
        }
    } catch (error) {
        console.error('Create Application Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.getUserApplications = async (req, res) => {
    try {
        const userId = req.user.id;
        let apps = [];

        if (isMongoConnected()) {
            apps = await Application.find({ userId })
                .populate('scholarshipId')
                .populate('mentorId')
                .sort({ submittedAt: -1 });
        } else {
            apps = memoryStore.applications.filter(a => a.userId === userId || a.userId === req.user._id);
            // Manually populate (simulate)
            apps = apps.map(app => {
                let populated = { ...app };
                if (app.scholarshipId) {
                    populated.scholarshipId = memoryStore.scholarships.find(s => s._id === app.scholarshipId || s.id === app.scholarshipId);
                }
                if (app.mentorId) {
                    populated.mentorId = memoryStore.mentors.find(m => m._id === app.mentorId || m.id === app.mentorId);
                }
                return populated;
            });
            apps.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        }

        res.json({ success: true, count: apps.length, data: apps });
    } catch (error) {
        console.error('Get Applications Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
