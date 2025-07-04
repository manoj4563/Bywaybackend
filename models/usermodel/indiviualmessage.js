const mongoose = require('mongoose');

const individualMessageSchema = new mongoose.Schema({
  holdername: {
    type: String,
    required: true
  },
  messagearray: {
    type: [
      {
        instructorid: { type: String, required: true },
        messagedetail: [
          {
            _id: false, // Prevents Mongoose from adding _id to each message
            message: { type: String, required: true },
            date: {
              type: String,
              default: () => new Date().toISOString() // Automatically set current time
            }
          }
        ]
      }
    ],
    default: []
  }
}, {
  timestamps: true // Adds createdAt and updatedAt at the document level
});

const IndiviualMessage = mongoose.model('indiviualmessage', individualMessageSchema);

module.exports = IndiviualMessage;
