"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
const mongoose = require("mongoose");
const commentSchema = new mongoose.Schema({
    author: {
        type: String,
        required: 'author is required'
    },
    body: {
        type: String,
        required: 'body is required'
    },
    queryId: {
        type: String
    },
    responseId: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastModifiedAt: {
        type: Date,
        default: Date.now
    },
    customAttributes: mongoose.Schema.Types.Mixed
});
const Comment = db_1.primaryDb.model('Comment', commentSchema);
exports.default = Comment;
