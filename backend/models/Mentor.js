import mongoose from 'mongoose';

const mentorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
    },
    company: {
      type: String,
      required: [true, 'Company/institution is required'],
    },
    organization: String,
    field: {
      type: String,
      required: [true, 'Field is required'],
    },
    expertise: [String],
    bio: {
      type: String,
      required: [true, 'Bio is required'],
    },
    education: String,
    experience: {
      type: String,
      enum: ['junior', 'mid', 'senior', 'lead', 'expert', 'entry'],
      default: 'mid',
    },
    specialization: [String],
    rate: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    mentees: {
      type: Number,
      default: 0,
    },
    totalMentees: {
      type: Number,
      default: 0,
    },
    sessions: {
      type: Number,
      default: 0,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    contactEmail: String,
    linkedIn: String,
    calendlyLink: String,
    imageUrl: {
      type: String,
      default: '',
    },
    profileImage: String,
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'inactive'],
      default: 'pending',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
mentorSchema.index({ name: 'text', bio: 'text', field: 1 });
mentorSchema.index({ status: 1 });
mentorSchema.index({ rating: -1, mentees: -1 });

export default mongoose.model('Mentor', mentorSchema);
