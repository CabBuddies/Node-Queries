"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const contentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: 'title is required'
    },
    body: {
        type: String,
        required: 'body is required'
    },
    tags: [
        String
    ],
    lastModifiedAt: {
        type: Date,
        default: Date.now
    }
});
exports.default = contentSchema;
