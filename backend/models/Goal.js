const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    type: {
        type: String,
        enum: ['goal', 'task', 'note', 'event'],
        default: 'goal'
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    dueDate: Date,
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    metadata: {
        type: Map,
        of: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Goal', goalSchema);
