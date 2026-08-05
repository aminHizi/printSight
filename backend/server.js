require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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
app.use(cors());
app.use(express.json());

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
app.post("/api/auth/login",async(req,res)=>{
  console.log("Login endpoint hit with body:", req.body);
  const {email,password}=req.body;
  if(!email||!password)
    return res.status(400).json({success: false, message:"Email and password are required"})
  //search for user with email 
  try{
  const user=await User.findOne({email});
  if(!user)
    console.log("User not found for email:", email);
    return res.status(401).json({success: false, message:"Invalid password or email"})

  const passwordMatch=await bcrypt.compare(password,user.password);
  if(!passwordMatch)
    return res.status(401).json({success: false, message:"Invalid password or email"})
  //create JWT
  const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'1h'});
  res.status(200).json({success: true, token});}
  catch(error){
    res.status(500).json({success: false, message:"login error", error:error.message})
  }


})
