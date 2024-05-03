const mongoose = require('mongoose');


const EventsDataSchema = new mongoose.Schema({
Event:{type:String,required:true},
Link:{type:String,required:true},
Bookmaker_1:{type:String,required:true},
over1:{type:Number,required:true},
Bookmaker_2:{type:String,required:true},
under2:{type:Number,required:true},
ratio:{type:Number,required:true},
event_id:{type:String,required:true,unique:true},
})


const EventsData = mongoose.model('EventsData', EventsDataSchema);

module.exports = EventsData;