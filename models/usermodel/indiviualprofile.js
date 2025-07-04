const mongoose = require('mongoose');

const indiviualprofileschema = new mongoose.Schema({
    holdername: {
        type: String,
        required: true
    },
    headline:{
        type:String,
        default:''
        
    },
    description:{
        type:String,
        default:''
    },
    language:{
       type:Array,
        default:[]
    },
    image:{
        type:String,
        default:''
    },
    links:{
        type:Array,
        default:[]
    }
})

const indiviualprofile=mongoose.model('indiviualprofile',indiviualprofileschema);

module.exports=indiviualprofile;