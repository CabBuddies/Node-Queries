"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const node_library_1 = require("node-library");
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const response_routes_1 = require("./response.routes");
const comment_routes_1 = require("./comment.routes");
const opinion_routes_1 = require("./opinion.routes");
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
};
router.post('/', node_library_1.Middlewares.authCheck(true), validatorMiddleware.validateRequestBody(schema), controller.create);
router.get('/', node_library_1.Middlewares.authCheck(false), controller.getAll);
router.get('/:id', node_library_1.Middlewares.authCheck(false), controller.get);
router.put('/:id', node_library_1.Middlewares.authCheck(true), middlewares_1.isAuthor(authorService), validatorMiddleware.validateRequestBody(schema), controller.update);
router.delete('/:id', node_library_1.Middlewares.authCheck(true), middlewares_1.isAuthor(authorService), controller.delete);
const queryExists = (req, res, next) => {
    const request = res.locals.request;
    console.log('\n\n\nqueryExists\n\n\n', request.getRaw(), '\n\n\n');
    next();
};
const queryCanRead = (req, res, next) => {
    const request = res.locals.request;
    console.log('\n\n\nqueryCanRead\n\n\n', request.getRaw(), '\n\n\n');
    next();
};
router.param('queryId', (req, res, next, value, name) => {
    const request = res.locals.request;
    console.log('\n\n\nrouter.param\n\n\n', name, value, '\n\n\n');
    request.raw.params[name] = value;
    next();
});
// router.route('/:queryId/comment').all(queryExists).all(queryCanRead);
// router.route('/:queryId/opinion').all(queryExists).all(queryCanRead);
router.use('/:queryId/response', queryExists, queryCanRead, response_routes_1.default);
router.use('/:queryId/comment', queryExists, queryCanRead, comment_routes_1.default);
router.use('/:queryId/opinion', queryExists, queryCanRead, opinion_routes_1.default);
exports.default = router;
