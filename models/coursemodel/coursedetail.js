const mongoose = require('mongoose')

const coursedetailschema = new mongoose.Schema({
    category: {
        type: String,
        required: true
    },
    courseid:{
        type: String,
        required: true
    },
    coursename: {
        type: String,
        required: true
    },
    instructorid: {
        type: String,
        required: true
    },
    bannertext: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: false,
        default: 1
    },
    language: {
        type: String,
        required: true
    },
    courseoverview: {
        type: Array,
        required: true
    },
    keylearning: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    totalbuy: {
        type: Number,
        required: false,
        default: 0
    },
    coursethumbnail:{
        type: String,
        required: true
    },
    totalreview:{
        type:Number,
        default:0
    },
    totalrating:{
        type:Number,
        default:0
    }
})

const coursedetail = mongoose.model('coursedetail', coursedetailschema);

module.exports = coursedetail;