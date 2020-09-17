"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const node_library_1 = require("node-library");
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const router = express_1.Router();
const controller = new controllers_1.ResponseController();
const authorService = (controller.service);
router.post('/', node_library_1.Middlewares.authCheck(true), node_library_1.Middlewares.validateRequestBody([
    { name: 'status', type: 'string', trim: true, lower: true, defaultValue: 'draft', anyOf: ['draft', 'published'] },
    { name: 'queryId', type: 'string' },
    { name: 'draft.title', type: 'string', max: 140, trim: true },
    { name: 'draft.body', type: 'string', max: 500, trim: true },
    { name: 'published.title', type: 'string', max: 140, trim: true },
    { name: 'published.body', type: 'string', max: 500, trim: true },
    { name: 'customAttributes', type: 'any', optional: true }
]), controller.create);
router.get('/', node_library_1.Middlewares.authCheck(false), controller.getAll);
router.get('/:id', node_library_1.Middlewares.authCheck(false), controller.get);
router.put('/:id', node_library_1.Middlewares.authCheck(true), middlewares_1.isAuthor(authorService), node_library_1.Middlewares.validateRequestBody([
    { name: 'status', type: 'string', trim: true, lower: true, defaultValue: 'draft', anyOf: ['draft', 'published'] },
    { name: 'draft.title', type: 'string', max: 140, trim: true },
    { name: 'draft.body', type: 'string', max: 500, trim: true },
    { name: 'published.title', type: 'string', max: 140, trim: true },
    { name: 'published.body', type: 'string', max: 500, trim: true },
    { name: 'customAttributes', type: 'any', optional: true }
]), controller.update);
router.delete('/:id', node_library_1.Middlewares.authCheck(true), middlewares_1.isAuthor(authorService), controller.delete);
exports.default = router;
