const mongoose = require('mongoose');
const EventsLinks = require('../models/EventsLinks'); // Import your Mongoose model

async function updateProcessedField() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost/Events', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Find all documents where Proccessed is false and update them to true
        const result = await EventsLinks.updateMany({ Proccessed: true }, { $set: { Proccessed: false } });

        console.log(`${result.nModified} documents updated.`);
    } catch (error) {
        console.error('Error updating documents:', error);
    } finally {
        // Close the MongoDB connection
        await mongoose.connection.close();
    }
}

// Call the function to update the documents
updateProcessedField();
