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

// Connect to your MongoDB Atlas instance using the connection string from .env
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Listen for connection events
const db = mongoose.connection;

db.on('error', err => {
  console.error('MongoDB connection error:', err);
});

db.once('open', () => {
  console.log('Connected to MongoDB');
});
