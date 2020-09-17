import * as mongoose from 'mongoose';
const Str = mongoose.Schema.Types.String as any;
Str.checkRequired(v => v != null);

import Query from './query.model';
import Response from './response.model';
import Comment from './comment.model';
import Opinion from './opinion.model';
import Tag from './tag.model';
import User from './user.model';

export {
    Query,
    Response,
    Comment,
    Opinion,
    Tag,
    User
}