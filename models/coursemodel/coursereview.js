const mongoose =require('mongoose')


const coursereviewschema= new mongoose.Schema({
    courseid:{
        type:String,
        required:true
    },
    coursereview:{
        type:Array,
        required:false,
        default:[]
    }
})

const coursereview=mongoose.model("coursereview",coursereviewschema)
module.exports=coursereview;