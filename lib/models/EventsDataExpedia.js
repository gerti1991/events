const mongoose = require('mongoose');

// Define the schema for the events data
const EventsDataExpediaSchema = new mongoose.Schema({
    Link: { type: String, required: true },
    Bookmaker_1: { type: String, required: true },
    linkBetB1: { type: String, required: true },
    over1: { type: Number, required: true },
    Bookmaker_2: { type: String, required: true },
    linkBetB2: { type: String, required: true },
    under2: { type: Number, required: true },
    ratio: { type: Number, required: true },
    event_id: { type: String, required: true, unique: true },
    Date: { type: String, required: true }
});

// Create the model
const EventsDataExpedia = mongoose.model('EventsDataExpedia', EventsDataExpediaSchema);

module.exports = EventsDataExpedia;
