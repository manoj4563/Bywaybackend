const mongoose = require('mongoose');

const userlogin =new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    carddata:{
        type:Array,
        required:false,
        default:[]
    },
    whisliste:{
        type:Array,
        required:false,
        default:[]
    },
    notification:{
        type:Array,
        required:false,
        default:[]
    },
    myreview:{
        type:Array,
        required:false,
        default:[]
    }


})
 
const logindetail=mongoose.model('userlogin',userlogin)

module.exports=logindetail; 