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
    commentCount:{
        type:Number,
        default:0
    },
    followCount:{
        type:Number,
        default:0
    },
    //query and response props
    upvoteCount:{
        type:Number,
        default:0
    },
    downvoteCount:{
        type:Number,
        default:0
    },
    spamreportCount:{
        type:Number,
        default:0
    },
    score:{
        type:Number,
        default:0
    }
});

export default statsSchema;