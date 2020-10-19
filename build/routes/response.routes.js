"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const node_library_1 = require("node-library");
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const comment_routes_1 = require("./comment.routes");
const opinion_routes_1 = require("./opinion.routes");
const router = express_1.Router();
const controller = new controllers_1.ResponseController();
const authorService = (controller.service);
const validatorMiddleware = new node_library_1.Middlewares.ValidatorMiddleware([
    {
        "id": "/contentSchema",
        "type": "object",
        "additionalProperties": false,
        "minProperties": 4,
        "properties": {
            "_id": {
                "type": "string"
            },
            "title": {
                "type": "string"
            },
            "body": {
                "type": "string"
            },
            "tags": {
                "type": "array",
                "uniqueItems": true,
                "items": {
                    "type": "string"
                }
            }
        }
    }
]);
router.post('/', node_library_1.Middlewares.authCheck(true), validatorMiddleware.validateRequestBody({
    "type": "object",
    "additionalProperties": false,
    "required": ["queryId", "draft", "published", "status"],
    "properties": {
        "queryId": {
            "type": "string"
        },
        "draft": {
            "$ref": "/contentSchema"
        },
        "published": {
            "$ref": "/contentSchema"
        },
        "customAttributes": {
            "type": "object"
        },
        "status": {
            "type": "string",
            "enum": ["draft", "published", "deleted"]
        }
    }
}), controller.create);
router.get('/', node_library_1.Middlewares.authCheck(false), controller.getAll);
router.get('/:id', node_library_1.Middlewares.authCheck(false), controller.get);
router.put('/:id', node_library_1.Middlewares.authCheck(true), middlewares_1.isAuthor(authorService), validatorMiddleware.validateRequestBody({
    "type": "object",
    "additionalProperties": false,
    "required": ["draft", "published", "status"],
    "properties": {
        "draft": {
            "$ref": "/contentSchema"
        },
        "published": {
            "$ref": "/contentSchema"
        },
        "customAttributes": {
            "type": "object"
        },
        "status": {
            "type": "string",
            "enum": ["draft", "published", "deleted"]
        }
    }
}), controller.update);
router.delete('/:id', node_library_1.Middlewares.authCheck(true), middlewares_1.isAuthor(authorService), controller.delete);
router.use('/:responseId/comment', comment_routes_1.default);
router.use('/:responseId/opinion', opinion_routes_1.default);
exports.default = router;
