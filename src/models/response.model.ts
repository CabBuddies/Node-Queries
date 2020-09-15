import {primaryDb} from '../db';
import * as mongoose from 'mongoose';
import {Schemas} from 'node-library';
import {contentSchema,statsSchema} from '../schemas';
const responseSchema = new mongoose.Schema({
    author:{
        type:String,
        required: 'author is required'
    },
    queryId:{
        type:String,
        required: 'queryId is required'
    },
    published:contentSchema,
    draft:contentSchema,
    createdAt:{
        type: Date,
        default: Date.now
    },
    status:{
        type:String,
        enum:['draft','published','deleted'],
        default: 'draft'
    },
    customAttributes:mongoose.Schema.Types.Mixed,
    stats:statsSchema
});


const Response = primaryDb.model('Response',responseSchema);

export default Response;