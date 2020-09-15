import {primaryDb} from '../db';
import * as mongoose from 'mongoose';
import {Schemas} from 'node-library';

const commentSchema = new mongoose.Schema({
    author:{
        type:String,
        required: 'author is required'
    },
    body:{
        type:String,
        required: 'body is required'
    },
    queryId:{
        type:String
    },
    responseId:{
        type:String
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    lastModifiedAt:{
        type: Date,
        default: Date.now
    },
    customAttributes:mongoose.Schema.Types.Mixed
});

const Comment = primaryDb.model('Comment',commentSchema);

export default Comment;