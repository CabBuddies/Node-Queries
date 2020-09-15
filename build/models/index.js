"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.Tag = exports.Opinion = exports.Comment = exports.Response = exports.Query = void 0;
const query_model_1 = require("./query.model");
exports.Query = query_model_1.default;
const response_model_1 = require("./response.model");
exports.Response = response_model_1.default;
const comment_model_1 = require("./comment.model");
exports.Comment = comment_model_1.default;
const opinion_model_1 = require("./opinion.model");
exports.Opinion = opinion_model_1.default;
const tag_model_1 = require("./tag.model");
exports.Tag = tag_model_1.default;
const user_model_1 = require("./user.model");
exports.User = user_model_1.default;