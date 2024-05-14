const mongoose = require('mongoose');

const EventsDatesSchema = new mongoose.Schema({

    EventDate: { type: String, required: true },
    EventDateId: { type: String, required: true, unique: true },
    Proccessed: { type: Boolean, default: false },
    UPDATED_AT: { type: String, default: Date.now },
    Date: { type: String, required: true },
})

const EventsDates = mongoose.model('EventsDates', EventsDatesSchema);

module.exports = EventsDates;