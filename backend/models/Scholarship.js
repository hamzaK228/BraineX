import mongoose from 'mongoose';

const scholarshipSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Scholarship name is required'],
      trim: true,
    },
    organization: {
      type: String,
      required: [true, 'Organization is required'],
      trim: true,
    },
    amount: {
      type: String,
      required: [true, 'Funding amount is required'],
    },
    field: {
      type: String,
      default: 'All fields',
    },
    deadline: {
      type: Date,
    },
    level: {
      type: String,
      enum: ['Undergraduate', 'Graduate', 'PhD', 'Postdoc', 'All Levels'],
      default: 'All Levels',
    },
    category: {
      type: String,
      default: 'General',
    },
    location: String,
    country: String,
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    requirements: [String],
    benefits: [String],
    applicationLink: String,
    website: String,
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'rejected', 'closed', 'upcoming', 'expired'],
      default: 'active',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

// Text index for search
scholarshipSchema.index({ name: 'text', organization: 'text', description: 'text' });
scholarshipSchema.index({ status: 1, deadline: 1 });
scholarshipSchema.index({ category: 1 });
scholarshipSchema.index({ country: 1 });

export default mongoose.model('Scholarship', scholarshipSchema);
