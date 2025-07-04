// models/Counter.js
const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: String,            // name of the counter, e.g., 'review'
  seq: { type: Number, default: 0 }
});

const counter = mongoose.model('Counter', counterSchema);
 
module.exports=counter