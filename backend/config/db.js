const mongoose = require('mongoose');

const connectDB = async () => {
    const url = process.env.MONGODB_URI;
    if(!url) {
        throw new Error('MongoDB connection URL is not defined in environment variables');
    }
    try{
        await mongoose.connect(url);
        console.log('MongoDB connected successfully');

    }catch(err){
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1);
    }
}
module.exports = connectDB;
    