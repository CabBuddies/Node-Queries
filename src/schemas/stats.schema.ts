import * as mongoose from 'mongoose';

const statsSchema = new mongoose.Schema({
    viewCount:{
        type:Number,
        default:0
    },
    responseCount:{
        type:Number,
        default:0
    },
    followCount:{
        type:Number,
        default:0
    },
    //query and response props
    upVoteCount:{
        type:Number,
        default:0
    },
    downVoteCount:{
        type:Number,
        default:0
    },
    spamReportCount:{
        type:Number,
        default:0
    },
    score:{
        type:Number,
        default:0
    }
});

export default statsSchema;