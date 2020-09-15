"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = exports.TagService = exports.ResponseService = exports.OpinionService = exports.CommentService = exports.QueryService = exports.AuthorService = void 0;
const query_service_1 = require("./query.service");
exports.QueryService = query_service_1.default;
const comment_service_1 = require("./comment.service");
exports.CommentService = comment_service_1.default;
const opinion_service_1 = require("./opinion.service");
exports.OpinionService = opinion_service_1.default;
const response_service_1 = require("./response.service");
exports.ResponseService = response_service_1.default;
const tag_service_1 = require("./tag.service");
exports.TagService = tag_service_1.default;
const user_service_1 = require("./user.service");
exports.UserService = user_service_1.default;
const author_service_1 = require("./author.service");
exports.AuthorService = author_service_1.default;