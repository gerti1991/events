import mongoose, { Schema } from 'mongoose';

const subscriberSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  authKey: {
    type: String,
    required: true,
    unique: true
  },
  max_rate: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    default: 'Inactive'
  },
  creationDate: {
    type: Date,
    required: true,
    default: Date.now
  }
});

// Define the Subscriber model
const Subscriber = mongoose.model('Subscriber', subscriberSchema);

export default Subscriber; // Export the model, not the schema
