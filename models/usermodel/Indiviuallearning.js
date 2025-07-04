const mongoose = require('mongoose');

// Schema for each lesson inside a course
const lessonStatusSchema = new mongoose.Schema({
  section: String,
  lesson: String,
  coursecontent: String,
  completed: { type: Boolean, default: false },
  viewed: { type: Boolean, default: false },
  viewedAt: Date
}, { _id: false });

// Schema for each course
const courseSchema = new mongoose.Schema({
  courseid: String,
  coursestatus: [lessonStatusSchema]
}, { _id: false });

// Main user schema
const indiviuallearnschema = new mongoose.Schema({
  holdername: {
    type: String,
    required: true
  },
  courses: {
    type: [courseSchema], // ✅ Now using proper nested subdocuments
    default: []
  }
});

// Use the same model name
const indiviuallearning = mongoose.model('indiviuallearning', indiviuallearnschema);

module.exports = indiviuallearning;
