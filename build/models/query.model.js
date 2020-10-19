"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
const mongoose = require("mongoose");
const schemas_1 = require("../schemas");
const querySchema = new mongoose.Schema({
    author: {
        type: String,
        required: 'author is required'
    },
    published: schemas_1.contentSchema,
    draft: schemas_1.contentSchema,
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'deleted'],
        default: 'draft'
    },
    customAttributes: mongoose.Schema.Types.Mixed,
    stats: schemas_1.statsSchema,
    access: {
        type: String,
        enum: ['public', 'followers', 'private'],
        default: 'public'
    }
});
const Query = db_1.primaryDb.model('Query', querySchema);
exports.default = Query;
