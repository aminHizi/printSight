const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  owner: { type: String, required: true, unique: true, index: true }, // Scoped to User email
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  preferences: {
    criticalNotifications: { type: Boolean, default: true },
    weeklyDigest: { type: Boolean, default: false },
    autoRefresh: { type: Boolean, default: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);
