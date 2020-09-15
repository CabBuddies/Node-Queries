import {primaryDb} from '../db';
import * as mongoose from 'mongoose';
import {Schemas} from 'node-library';

const opinionSchema = new mongoose.Schema({
    author:{
        type:String,
        required: 'author is required'
    },
    body:{
        type:String
    },
    queryId:{
        type:String
    },
    responseId:{
        type:String
    },
    opinionType:{
        type:String,
        enum:['follow','upvote','downvote','spamreport'],
        default:'upvote'
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    customAttributes:mongoose.Schema.Types.Mixed
});

const Opinion = primaryDb.model('Opinion',opinionSchema);

export default Opinion;