"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDocumentExists = exports.isAuthor = void 0;
const author_middleware_1 = require("./author.middleware");
exports.isAuthor = author_middleware_1.default;
const document_exists_middleware_1 = require("./document.exists.middleware");
exports.checkDocumentExists = document_exists_middleware_1.default;
