import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Project title is required'],
            trim: true,
        },
        description: String,
        field: String,
        category: String,
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        collaborators: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        status: {
            type: String,
            enum: ['planning', 'active', 'completed', 'archived'],
            default: 'active',
        },
        difficulty: String,
        estimatedTime: String,
        tags: [String],
        skills: [String],
        tools: [String],
        githubLink: String,
        demoLink: String,
        link: String,
        image: String,
        icon: String,
        color: String,
        isPublic: {
            type: Boolean,
            default: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

projectSchema.index({ title: 'text', description: 'text' });
projectSchema.index({ field: 1, status: 1 });

export default mongoose.model('Project', projectSchema);
