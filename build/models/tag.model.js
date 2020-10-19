"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
const mongoose = require("mongoose");
const tagSchema = new mongoose.Schema({
    tag: {
        type: String,
        required: 'tag is required',
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastModifiedAt: {
        type: Date,
        default: Date.now
    },
    count: {
        type: Number,
        default: 0
    },
    queries: [
        String
    ]
});
const Tag = db_1.primaryDb.model('Tag', tagSchema);
exports.default = Tag;
