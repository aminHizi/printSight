require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
// Import Schemas
const User = require('./models/User');
const Printer = require('./models/Printer');
const Log = require('./models/Log');
const Settings = require('./models/Settings');

// Import real auth middleware (verifies signed JWTs, attaches req.user)
const authMiddleware = require('./middleware/auth');

const app = express();
  const PORT = process.env.PORT ;
const MONGODB_URI = process.env.MONGODB_URI;
const connectDB = require('./config/db');
app.use(cors({
  origin: 'http://localhost:5173', // your Vite dev server, not '*'
  credentials: true // required for cookies to be sent/accepted
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
// ---------- MongoDB Connection ----------
connectDB();
//------------------------------------------

app.listen(PORT, () => {  
  console.log(`Server running on port ${PORT}`);
});
app.post("/api/auth/register",async (req,res)=>{
  console.log("Register endpoint hit with body:", req.body);
  const { email, name, password} = req.body;
  

  if (!email || !name || !password) {
    return res.status(400).json({ message: "Email, name, and password are required" });
  }

  try{
    const HashedPassword = await bcrypt.hash(password,10);
    const user = new User({ email, name, password: HashedPassword });
    await user.save();
    res.status(201).json({ success: true, message: "User created successfully" });
    console.log("User created successfully:", user);
  } catch (error) {
    res.status(400).json({success: false, message: "Error creating user", error: error.message });
  }
});
app.post("/api/auth/login", async (req, res) => {
  console.log("Login endpoint hit with body:", req.body);
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: "Email and password are required" });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(401).json({ success: false, message: "Invalid password or email" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.log("Password mismatch for user:", email);
      return res.status(401).json({ success: false, message: "Invalid password or email" });
    }

    // create JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 3600000
    });

    res.status(200).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "login error", error: error.message });
  }
});
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ success: true });
});
app.get('/api/printers', authMiddleware, async (req, res) => {
  const userId = req.user._id;
  try{
    const printers = await Printer.find({ userId });
    res.status(200).json(printers);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching printers", error: error.message });
  }
})
app.post('/api/addPrinter', authMiddleware, async (req, res) => {
  const userId = req.user._id;
  const { name, type, ip, materialType, spoolRemaining, filamentDiameter, thumbnail } = req.body;

  if (!name || !type) {
    return res.status(400).json({ success: false, message: "Printer name and type are required" });
  }

  try {
    const newPrinter = new Printer({
      userId,
      name,
      type,
      ip: ip || '',
      materialType,
      spoolRemaining,
      filamentDiameter,
      thumbnail
    });
    await newPrinter.save();
    res.status(201).json({ success: true, message: "Printer added successfully", printer: newPrinter });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding printer", error: error.message });
  }
});

// GET /api/logs - Fetch logs with optional filters (authenticated)
app.get('/api/logs', authMiddleware, async (req, res) => {
  const owner = req.user.email;
  const { printer, severity, search } = req.query;

  const query = { owner };

  if (printer && printer !== 'All Printers') {
    query.printerName = printer;
  }

  if (severity && severity !== 'All Severities') {
    query.severity = severity;
  }

  if (search) {
    query.$or = [
      { message: { $regex: search, $options: 'i' } },
      { errorCode: { $regex: search, $options: 'i' } }
    ];
  }

  try {
    const logs = await Log.find(query).sort({ createdAt: -1 });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching logs", error: error.message });
  }
});

// POST /api/logs - Receive log from external nodes (public/Postman)
app.post('/api/logs', async (req, res) => {
  console.log("Receive log endpoint hit with body:", req.body);
  const { owner, printerName, errorCode, message, severity, timestamp } = req.body;

  if (!owner || !printerName || !message) {
    return res.status(400).json({ success: false, message: "owner (email), printerName, and message are required" });
  }

  try {
    const newLog = new Log({
      owner,
      printerName,
      errorCode: errorCode || 'I-0000-G',
      message,
      severity: severity || 'INFO',
      timestamp: timestamp || new Date().toISOString().replace('T', ' ').substring(0, 19)
    });

    await newLog.save();

    // If critical alert, update the printer status to ERROR automatically
    if (severity === 'CRITICAL') {
      const user = await User.findOne({ email: owner });
      if (user) {
        await Printer.findOneAndUpdate(
          { name: printerName, userId: user._id },
          { status: 'ERROR', errorAlert: message }
        );
      }
    }

    res.status(201).json({ success: true, message: "Log received and saved successfully", log: newLog });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error saving log", error: error.message });
  }
});