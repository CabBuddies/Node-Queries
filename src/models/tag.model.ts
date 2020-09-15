import {primaryDb} from '../db';
import * as mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
    tag:{
        type:String,
        required: 'tag is required',
        unique: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    lastModifiedAt:{
        type: Date,
        default: Date.now
    },
    count:{
        type:Number,
        default:0
    },
    queries:[
        mongoose.Schema.Types.ObjectId
    ]
});


const Tag = primaryDb.model('Tag',tagSchema);

export default Tag;