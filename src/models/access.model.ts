import {primaryDb} from '../db';
import * as mongoose from 'mongoose';
import {Schemas} from 'node-library';

const accessSchema = new mongoose.Schema({
    author:{
        type:String,
        required:'author is required'
    },
    queryId:{
        type:String,
        required:'queryId is required'
    },
    userId:{
        type:String,
        required:'userId is required'
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    lastModifiedAt:{
        type: Date,
        default: Date.now
    },
    status:{
        type:String,
        enum:["granted","revoked","requested"],
        default:"requested"
    },
    customAttributes:mongoose.Schema.Types.Mixed
});

const Access = primaryDb.model('Access',accessSchema);

export default Access;