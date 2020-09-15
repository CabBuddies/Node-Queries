"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const node_library_1 = require("node-library");
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const { checkSchema } = require('express-validator');
const router = express_1.Router();
const controller = new controllers_1.QueryController();
const authorService = (controller.service);
router.post('/', node_library_1.Middlewares.authCheck(true), node_library_1.Middlewares.validateRequestBody([
    { name: 'status', type: 'string', trim: true, lower: true, defaultValue: 'draft', anyOf: ['draft', 'published'] },
    { name: 'draft.title', type: 'string', min: 2, max: 140, trim: true, optional: true },
    { name: 'draft.body', type: 'string', min: 2, max: 500, trim: true, optional: true },
    { name: 'draft.tags', type: 'array', array_defaultValue: [], array_unique: true, array_normalize: true, array_item_type: 'string', trim: true, lower: true, optional: true },
    { name: 'published.title', type: 'string', min: 2, max: 140, trim: true, optional: true },
    { name: 'published.body', type: 'string', min: 2, max: 500, trim: true, optional: true },
    { name: 'published.tags', type: 'array', array_defaultValue: [], array_unique: true, array_normalize: true, array_item_type: 'string', trim: true, lower: true, optional: true },
    { name: 'customAttributes', type: 'any', optional: true }
]), controller.create);
router.get('/', node_library_1.Middlewares.authCheck(false), controller.getAll);
router.get('/:id', node_library_1.Middlewares.authCheck(false), controller.get);
router.put('/:id', node_library_1.Middlewares.authCheck(true), middlewares_1.isAuthor(authorService), node_library_1.Middlewares.validateRequestBody([
    { name: 'status', type: 'string', trim: true, lower: true, defaultValue: 'draft', anyOf: ['draft', 'published'] },
    { name: 'draft.title', type: 'string', min: 2, max: 140, trim: true, optional: true },
    { name: 'draft.body', type: 'string', min: 2, max: 500, trim: true, optional: true },
    { name: 'draft.tags', type: 'array', array_defaultValue: [], array_unique: true, array_normalize: true, array_item_type: 'string', trim: true, lower: true, optional: true },
    { name: 'published.title', type: 'string', min: 2, max: 140, trim: true, optional: true },
    { name: 'published.body', type: 'string', min: 2, max: 500, trim: true, optional: true },
    { name: 'published.tags', type: 'array', array_defaultValue: [], array_unique: true, array_normalize: true, array_item_type: 'string', trim: true, lower: true, optional: true },
    { name: 'customAttributes', type: 'any', optional: true }
]), controller.update);
router.delete('/:id', node_library_1.Middlewares.authCheck(true), middlewares_1.isAuthor(authorService), controller.delete);
exports.default = router;
