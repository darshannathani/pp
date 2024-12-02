import mongoose from "mongoose";


const Schema = mongoose.Schema;

const webTaskResponseModel = new Schema ({
    taskId : {
        type : Schema.Types.ObjectId,
        ref : 'Web',
        required : true,
    },
    testerId : {
        type : Schema.Types.ObjectId,
        reference : 'Tester',
        required : true,
    },
    response : [{
        questionId : {
            type : Number,
            required : true,
        },
        answer :{
            type : String ,
            required : true
        }
    }]
},{timestamps: true})

const WebResponse = mongoose.models.WebResponse || mongoose.model("WebResponse", webTaskResponseModel);


export default WebResponse;