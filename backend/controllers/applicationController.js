// Application Controller - MongoDB/Mongoose
import mongoose from 'mongoose';

// Simple Application schema (if Application model doesn't exist, create inline)
let Application;
try {
    Application = mongoose.model('Application');
} catch {
    const applicationSchema = new mongoose.Schema(
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            scholarshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scholarship' },
            mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' },
            type: { type: String, required: true },
            data: { type: mongoose.Schema.Types.Mixed },
            status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
            submittedAt: { type: Date, default: Date.now },
        },
        { timestamps: true }
    );
    Application = mongoose.model('Application', applicationSchema);
}

/**
 * Create application
 * @route POST /api/applications
 */
export const createApplication = async (req, res) => {
    try {
        const { scholarshipId, mentorId, type, data } = req.body;
        const userId = req.user.id;

        // Check for existing application
        const existing = await Application.findOne({ userId, type, scholarshipId, mentorId });
        if (existing) {
            return res.status(400).json({ success: false, error: 'You have already applied.' });
        }

        const application = await Application.create({
            userId,
            scholarshipId: scholarshipId || undefined,
            mentorId: mentorId || undefined,
            type,
            data,
            status: 'pending',
        });

        res.status(201).json({ success: true, data: application });
    } catch (error) {
        console.error('Create Application Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

/**
 * Get user applications
 * @route GET /api/applications
 */
export const getUserApplications = async (req, res) => {
    try {
        const userId = req.user.id;

        const apps = await Application.find({ userId })
            .populate('scholarshipId', 'name organization')
            .populate('mentorId', 'name title')
            .sort({ submittedAt: -1 });

        res.json({ success: true, count: apps.length, data: apps });
    } catch (error) {
        console.error('Get Applications Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

export default {
    createApplication,
    getUserApplications,
};
