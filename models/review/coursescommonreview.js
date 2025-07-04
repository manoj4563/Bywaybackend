// models/CourseReview.js
const mongoose = require('mongoose');
const Counter = require('./counter.js'); // import counter model

const coursereviewschema = new mongoose.Schema({
  reviewid: { type: String, required: true, unique: true }, // unique auto-incremented ID
  holdername: { type: String, required: true },
  courseid: { type: String, required: true },
  review: { type: String, required: true },
  rating: { type: Number, required: true }
});




const coursecommonreview = mongoose.model('coursescommonreview', coursereviewschema);
module.exports = coursecommonreview;
