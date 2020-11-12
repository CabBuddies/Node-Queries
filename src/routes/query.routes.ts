import * as express from 'express';
import { Router } from 'express';
import { Services, Middlewares } from 'node-library';
import { QueryController } from '../controllers';

import ResponseRouter from './response.routes';
import CommentRouter from './comment.routes';
import OpinionRouter from './opinion.routes';
import AccessRoutes from './access.routes';

import canAccessQuery from '../middlewares/query.access.middleware';

const router = Router()

const controller = new QueryController();

const authorService : Services.AuthorService = <Services.AuthorService> (controller.service);

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
    "required": ["draft","published"],
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
        },
        "access":{
            "type":"string",
            "enum":['public','followers','private']
        }
    }
};

router.param('id',Middlewares.addParamToRequest());

router.param('queryId',Middlewares.addParamToRequest());

router.post('/',Middlewares.authCheck(true),validatorMiddleware.validateRequestBody(schema),controller.create)

router.post('/search',Middlewares.authCheck(false),controller.getAll)

router.get('/:id',Middlewares.checkDocumentExists(authorService,'id'),canAccessQuery('id'),Middlewares.authCheck(false),controller.get)

router.put('/:id',Middlewares.checkDocumentExists(authorService,'id'),Middlewares.authCheck(true),Middlewares.isAuthor(authorService),validatorMiddleware.validateRequestBody(schema),controller.update)

router.delete('/:id',Middlewares.authCheck(true),Middlewares.isAuthor(authorService),controller.delete)

const queryExists = Middlewares.checkDocumentExists(authorService,'queryId');

const queryCanRead = canAccessQuery('queryId');

console.log(queryExists,queryCanRead);

router.use('/:queryId/access',queryExists,AccessRoutes);
router.use('/:queryId/response',queryExists,queryCanRead,ResponseRouter);
router.use('/:queryId/comment',queryExists,queryCanRead,CommentRouter);
router.use('/:queryId/opinion',queryExists,queryCanRead,OpinionRouter);

export default router;