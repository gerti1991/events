const mongoose = require('mongoose');

// Define the schema for the events data
const EventsDataXpediaSchema = new mongoose.Schema({
    dat: { type: String, required: true }, // Match date
    home_team: { type: String, required: true }, // Home team name
    away_team: { type: String, required: true }, // Away team name
    country: { type: String, required: true }, // Country name
    championship: { type: String, required: true }, // Championship name
    link: { type: String, required: true }, // Link to the event
    event_id: { type: String, required: true, unique: true } // Event ID extracted from the link
});

// Create the model
const EventsDataXpedia = mongoose.model('EventsDataXpedia', EventsDataXpediaSchema);

module.exports = EventsDataXpedia;
