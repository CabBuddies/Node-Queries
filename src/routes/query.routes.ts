import * as express from 'express';
import { Router } from 'express';
import { Helpers, Middlewares } from 'node-library';
import { QueryController } from '../controllers';
import { isAuthor, checkDocumentExists } from '../middlewares';
import { AuthorService } from '../services';

import ResponseRouter from './response.routes';
import CommentRouter from './comment.routes';
import OpinionRouter from './opinion.routes';

const router = Router()

const controller = new QueryController();

const authorService : AuthorService = <AuthorService> (controller.service);

const validatorMiddleware = new Middlewares.ValidatorMiddleware([
    {
        "id": "/contentSchema",
        "type": "object",
        "additionalProperties": false,
        "required": ["title","body","tags"],  
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
    "required": ["draft","published","status"],
    "properties": {
        "draft": {
            "$ref": "/contentSchema"
        },
        "published": {
            "$ref": "/contentSchema"
        },
        "customAttributes":{
            "type":"object"
        },
        "status":{
            "type":"string",
            "enum":["draft","published","deleted"]
        }
    }
};

router.post('/',Middlewares.authCheck(true),validatorMiddleware.validateRequestBody(schema),controller.create)

router.get('/',Middlewares.authCheck(false),controller.getAll)

router.get('/:id',Middlewares.authCheck(false),controller.get)

router.put('/:id',Middlewares.authCheck(true),isAuthor(authorService),validatorMiddleware.validateRequestBody(schema),controller.update)

router.delete('/:id',Middlewares.authCheck(true),isAuthor(authorService),controller.delete)

const queryExists = checkDocumentExists(authorService,'queryId');

const queryCanRead = (req:express.Request, res:express.Response, next:express.NextFunction) => {
    const request : Helpers.Request = res.locals.request;
    console.log('\n\n\nqueryCanRead\n\n\n',request.getRaw(),'\n\n\n');
    next();
}

router.param('queryId',Middlewares.addParamToRequest());

router.use('/:queryId/response',queryExists,queryCanRead,ResponseRouter);
router.use('/:queryId/comment',queryExists,queryCanRead,CommentRouter);
router.use('/:queryId/opinion',queryExists,queryCanRead,OpinionRouter);

export default router;