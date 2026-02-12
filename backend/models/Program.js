import mongoose from 'mongoose';

const programSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Program name is required'],
            trim: true,
        },
        university: {
            type: String, // Can be String for existing data or ObjectId ref
        },
        universityRef: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'University',
        },
        degree: {
            type: String,
            enum: ['Bachelor', 'Master', 'PhD', 'Certificate', 'Diploma', 'MBA'],
            default: 'Master',
        },
        type: String,
        field: String,
        duration: String,
        tuitionFee: String,
        description: String,
        requirements: [String],
        features: [String],
        applicationDeadline: Date,
        deadline: String,
        location: String,
        country: String,
        rating: Number,
        link: String,
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

programSchema.index({ name: 'text', university: 'text' });
programSchema.index({ degree: 1, field: 1 });

export default mongoose.model('Program', programSchema);
