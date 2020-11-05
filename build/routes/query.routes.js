"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const node_library_1 = require("node-library");
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const response_routes_1 = require("./response.routes");
const comment_routes_1 = require("./comment.routes");
const opinion_routes_1 = require("./opinion.routes");
const access_routes_1 = require("./access.routes");
const query_access_middleware_1 = require("../middlewares/query.access.middleware");
const router = express_1.Router();
const controller = new controllers_1.QueryController();
const authorService = (controller.service);
const validatorMiddleware = new node_library_1.Middlewares.ValidatorMiddleware([
    {
        "id": "/contentSchema",
        "type": "object",
        "additionalProperties": false,
        "required": ["title", "body", "tags"],
        "properties": {
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
const schema = {
    "type": "object",
    "additionalProperties": false,
    "required": ["draft", "published"],
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
        },
        "access": {
            "type": "string",
            "enum": ['public', 'followers', 'private']
        }
    }
};
router.param('id', node_library_1.Middlewares.addParamToRequest());
router.param('queryId', node_library_1.Middlewares.addParamToRequest());
router.post('/', node_library_1.Middlewares.authCheck(true), validatorMiddleware.validateRequestBody(schema), controller.create);
router.get('/', node_library_1.Middlewares.authCheck(false), controller.getAll);
router.get('/:id', middlewares_1.checkDocumentExists(authorService, 'id'), query_access_middleware_1.default('id'), node_library_1.Middlewares.authCheck(false), controller.get);
router.put('/:id', middlewares_1.checkDocumentExists(authorService, 'id'), node_library_1.Middlewares.authCheck(true), middlewares_1.isAuthor(authorService), validatorMiddleware.validateRequestBody(schema), controller.update);
router.delete('/:id', node_library_1.Middlewares.authCheck(true), middlewares_1.isAuthor(authorService), controller.delete);
const queryExists = middlewares_1.checkDocumentExists(authorService, 'queryId');
const queryCanRead = query_access_middleware_1.default('queryId');
console.log(queryExists, queryCanRead);
router.use('/:queryId/access', queryExists, access_routes_1.default);
router.use('/:queryId/response', queryExists, queryCanRead, response_routes_1.default);
router.use('/:queryId/comment', queryExists, queryCanRead, comment_routes_1.default);
router.use('/:queryId/opinion', queryExists, queryCanRead, opinion_routes_1.default);
exports.default = router;
