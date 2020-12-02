import * as mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
    title:{
        type:String,
        required: 'title is required',
        minimize:false
    },
    body:{
        type:String,
        required: 'body is required',
        minimize:false
    },
    media:[{
        type:String
    }],
    tags:[
        String
    ],
    lastModifiedAt:{
        type: Date,
        default: Date.now
    }
});

export default contentSchema;