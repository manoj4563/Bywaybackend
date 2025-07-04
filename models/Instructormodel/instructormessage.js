const mongoose = require('mongoose');

const instructorMessageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true  // Optional but usually good for identifiers
  },
  messages: [
    {
      username: { type: String, required: false },
      messagedetail: [{
        message: { type: String,required: false  },
        data: { type: String,required: false  }
      }]
    }
  ]
});

const InstructorMessage = mongoose.model("InstructorMessage", instructorMessageSchema);

module.exports = InstructorMessage;
