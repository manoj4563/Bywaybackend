const mongoose = require('mongoose')

const instructordetailschema =new  mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    },
    label:{
        type:Array,
        required:true
    },
    totalStudents:{
        type:String,
        required:false,
        default:0
    },
    totalreview:{
        type:String,
        default:0
    },
    about:{
        type:String,
        required:true
    },
    areaofexperience:{
        type:Array,
        required:true

    },
    professionalexperience:{
        
            type:String,
            required:true
       
    },
    courses:{
        type:Array,
        default:[]
    },
    
    image:{
        type:String,
        required:true
    }
    
})

const instructordetail=mongoose.model('instructordetail',instructordetailschema)

module.exports=instructordetail;