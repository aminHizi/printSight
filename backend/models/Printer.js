const mongoose = require('mongoose');

const PrinterSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  status: { type: String, default: 'IDLE' },
  ip: { type: String, default: '' },
  nozzleTemp: { type: Number, default: 24 },
  targetNozzleTemp: { type: Number, default: 0 },
  bedTemp: { type: Number, default: 22 },
  targetBedTemp: { type: Number, default: 0 },
  currentJob: { type: String, default: '' },
  progress: { type: Number, default: 0 },
  timeRemaining: { type: String, default: '' },
  errorAlert: { type: String, default: null },
  thumbnail: { type: String, default: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKCyy2SN0brqqt34FOJYc8WFkwRfxun14j5soVjlbK6I0x6NKmwvPG-udQg6k98iAgcxvonDIakl4c3dT_n6oqyCdBZLkcdSlZA-jjMu_eA-0ZQpFFQQD1Fy0JLXQpLPHcUAomk7x9GI_64GVUIvqQrXxf3k2M7LUDX7EQJRsQzskvd_h6YzIqbpsh5dfHCrOl3gHHmAH1ATgdICoWzZxL_BmFiXgi_EdFXE781JIJb11FOzw-dItxlw' },
  accessLevel: { type: String, default: 'Standard Monitor' },
  spoolRemaining: { type: Number, default: 1000 },
  materialType: { type: String, default: 'PLA (Black)' },
  filamentDiameter: { type: Number, default: 1.75 }
}, { timestamps: true });

module.exports = mongoose.model('Printer', PrinterSchema);
