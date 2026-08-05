const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  owner: { type: String, required: true, index: true }, // Scoped to User email
  printerName: { type: String, required: true },
  errorCode: { type: String, default: 'I-0000-G' },
  message: { type: String, required: true },
  severity: { type: String, default: 'INFO' }, // INFO, WARNING, CRITICAL
  timestamp: { 
    type: String, 
    default: () => new Date().toISOString().replace('T', ' ').substring(0, 19)
  }
}, { timestamps: true });

module.exports = mongoose.model('Log', LogSchema);
