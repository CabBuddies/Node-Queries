"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
const mongoose = require("mongoose");
const accessSchema = new mongoose.Schema({
    author: {
        type: String,
        required: 'author is required'
    },
    queryId: {
        type: String,
        required: 'queryId is required'
    },
    userId: {
        type: String,
        required: 'userId is required'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastModifiedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["granted", "revoked", "requested"],
        default: "requested"
    },
    customAttributes: mongoose.Schema.Types.Mixed
});
const Access = db_1.primaryDb.model('Access', accessSchema);
exports.default = Access;
