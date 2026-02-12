import mongoose from 'mongoose';

const roadmapSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Roadmap title is required'],
            trim: true,
        },
        field: String,
        category: {
            type: String,
            default: 'General',
        },
        description: String,
        phases: [
            {
                phaseNumber: Number,
                title: String,
                description: String,
                tasks: [String],
                duration: String,
            },
        ],
        steps: [
            {
                title: String,
                description: String,
                resources: [String],
            },
        ],
        successRate: Number,
        timeline: String,
        duration: String,
        difficulty: String,
        icon: String,
        color: String,
        estimatedTime: String,
        skills: [String],
        prerequisites: [String],
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

roadmapSchema.index({ title: 'text', category: 1 });

export default mongoose.model('Roadmap', roadmapSchema);
