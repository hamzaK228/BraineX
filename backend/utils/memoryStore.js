// In-memory storage for Demo Mode
const memoryStore = {
    users: [],
    refreshTokens: []
};

// Helper to check if we should use demo mode
const mongoose = require('mongoose');
const isDemoMode = () => mongoose.connection.readyState !== 1;

module.exports = {
    memoryStore,
    isDemoMode
};
