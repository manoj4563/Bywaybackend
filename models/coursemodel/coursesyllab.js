const mongoose = require('mongoose');

// Define the lesson schema
const lessonSchema = new mongoose.Schema({
  lesson: String,
  coursecontent: String,
  lessonduration: Number
}, { _id: false });

// Define the section schema
const sectionSchema = new mongoose.Schema({
  section: String,
  lessons: [lessonSchema]
}, { _id: false });

// Define the full syllabus schema
const coursesyllabusschema = new mongoose.Schema({
  courseid: {
    type: String,
    required: true
  },
  syllabus: {
    type: [sectionSchema],
    default: []
  },
  totalduration: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const coursesyllabus = mongoose.model('coursesyllabus', coursesyllabusschema);
module.exports = coursesyllabus;
