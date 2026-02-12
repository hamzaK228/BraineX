import mongoose from 'mongoose';

const universitySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'University name is required'],
            trim: true,
        },
        country: String,
        location: String,
        region: String,
        ranking: Number,
        rank: Number,
        logo: String,
        website: String,
        description: String,
        type: String,
        studentCount: Number,
        acceptanceRate: String,
        internationalStudents: String,
        programs: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Program',
            },
        ],
        scholarships: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Scholarship',
            },
        ],
        departments: [String],
        specialties: [String],
        researchAreas: [String],
        features: [String],
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

universitySchema.index({ name: 'text', country: 'text' });
universitySchema.index({ ranking: 1 });
universitySchema.index({ country: 1 });

export default mongoose.model('University', universitySchema);
