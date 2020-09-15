"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
const mongoose = require("mongoose");
const opinionSchema = new mongoose.Schema({
    author: {
        type: String,
        required: 'author is required'
    },
    body: {
        type: String
    },
    queryId: {
        type: String
    },
    responseId: {
        type: String
    },
    opinionType: {
        type: String,
        enum: ['follow', 'upvote', 'downvote', 'spamreport'],
        default: 'upvote'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    customAttributes: mongoose.Schema.Types.Mixed
});
const Opinion = db_1.primaryDb.model('Opinion', opinionSchema);
exports.default = Opinion;
