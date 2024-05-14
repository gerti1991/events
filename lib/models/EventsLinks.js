const mongoose = require('mongoose');

const EventsLinksSchema = new mongoose.Schema({

    EventLink: { type: String, required: true },
    EventLinkId: { type: String, required: true },
    Proccessed: { type: Boolean, default: false },
    UPDATED_AT: { type: String, default: Date.now },
    Date: { type: String, required: true }
})

const EventsLinks = mongoose.model('EventsLinks', EventsLinksSchema);

module.exports = EventsLinks;