// const mongoose = require('mongoose');

// // Connect to your local MongoDB instance
// mongoose.connect('mongodb://localhost/Events', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// //   useCreateIndex: true, // Corrected option name
// });

// // Listen for connection events
// const db = mongoose.connection;

// db.on('error', err => {
//   console.error('MongoDB connection error:', err);
// });

// db.once('open', () => {
//   console.log('Connected to MongoDB');
// });

const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

// Function to connect to MongoDB
async function connectToMongoDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

// Call the function to connect to MongoDB
connectToMongoDB();

// Listen for connection events
const db = mongoose.connection;

db.on('error', err => {
  console.error('MongoDB connection error:', err);
});

db.once('open', () => {
  console.log('MongoDB connection is open');
});
