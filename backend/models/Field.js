import mongoose from 'mongoose';

const fieldSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Field name is required'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    icon: {
      type: String,
      default: '🎓',
    },
    color: {
      type: String,
      default: '#667eea',
    },
    salary: String,
    careers: [String],
    scholarshipCount: {
      type: Number,
      default: 0,
    },
    roadmapCount: {
      type: Number,
      default: 0,
    },
    mentorCount: {
      type: Number,
      default: 0,
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

fieldSchema.index({ name: 1 });
fieldSchema.index({ category: 1 });

export default mongoose.model('Field', fieldSchema);
