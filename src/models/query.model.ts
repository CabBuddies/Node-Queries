import {primaryDb} from '../db';
import * as mongoose from 'mongoose';
import {Schemas} from 'node-library';
import {contentSchema,statsSchema} from '../schemas';
const querySchema = new mongoose.Schema({
    author:{
        type:String,
        required: 'author is required'
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
    stats:statsSchema,
    access:{
        type:{
            type:String,
            enum:['public','followers','private'],
            default:'public'
        },
        users:[
            String
        ]
    }
});


const Query = primaryDb.model('Query',querySchema);

export default Query;