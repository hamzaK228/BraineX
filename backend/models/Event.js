import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: String,
    eventType: {
      type: String,
      enum: ['webinar', 'workshop', 'deadline', 'conference', 'meetup', 'hackathon'],
      default: 'webinar',
    },
    // Keep 'type' for backward-compatibility with existing data
    type: {
      type: String,
      default: 'Webinar',
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    endDate: Date,
    time: String,
    location: {
      type: String,
      default: 'Online',
    },
    format: {
      type: String,
      enum: ['virtual', 'in-person', 'hybrid'],
      default: 'virtual',
    },
    organizer: String,
    registrationLink: String,
    link: String,
    maxParticipants: Number,
    attendees: {
      type: Number,
      default: 0,
    },
    speakers: [String],
    tags: [String],
    image: String,
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'past', 'cancelled'],
      default: 'upcoming',
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

// Index for search and filtering
eventSchema.index({ title: 'text', description: 'text' });
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ eventType: 1 });

export default mongoose.model('Event', eventSchema);
