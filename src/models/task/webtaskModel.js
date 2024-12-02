import mongoose from "mongoose";

const webtaskSchema = new mongoose.Schema({
    creator :{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Creator',
        required : true
    },
    post_date : {
        type : Date,
        default : Date.now,
        required : true
    },
    end_date: {
        type : Date,
        required : true
    },
    tester_no : {
        type : Number,
        required : true
    },
    tester_age: {
        type : Number,
        required : true
    },
    tester_gender:{
        type : String,
        required : true
    },
    country:{
        type : String,
        required : true
    },
    heading:{
        type : String,
        required : true
    },
    instruction:{
        type : String,
        required : true
    },
    questions:[{
        title:String,
        answer_type:String,
    }],
    web_link:{
        type : String,
        required : true
    },
    tester_ids : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tester'
        }
    ],
},{timestamps: true})

const Web = mongoose.models.web || mongoose.model("web", webtaskSchema);

export default Web;