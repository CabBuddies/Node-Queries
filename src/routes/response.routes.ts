import * as express from 'express';
import { Router } from 'express';
import { Helpers, Middlewares, Services } from 'node-library';
import { ResponseController } from '../controllers';

import CommentRouter from './comment.routes';
import OpinionRouter from './opinion.routes';

const router = Router()

const controller = ResponseController;

const authorService : Services.AuthorService = <Services.AuthorService> (controller.service);


const validatorMiddleware = new Middlewares.ValidatorMiddleware([
    {
        "id": "/contentSchema",
        "type": "object",
        "additionalProperties": false,
        "required": ["title","body","media","tags"],  
        "properties": {
            "title": {
                "type": "string"
            },
            "body": {
                "type": "string"
            },
            "media": {
                "type": "array",
                "uniqueItems": true,
                "items": {
                    "type": "string"
                }
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
            "enum":["draft","published"]
        }
    }
};

router.post('/',Middlewares.authCheck(true,true),validatorMiddleware.validateRequestBody(schema),controller.create)

router.post('/search',Middlewares.authCheck(false),controller.getAll)

router.get('/:id',Middlewares.authCheck(false),controller.get)

router.put('/:id',Middlewares.authCheck(true,true),Middlewares.isAuthor(authorService),validatorMiddleware.validateRequestBody(schema),controller.update)

router.delete('/:id',Middlewares.authCheck(true,true),Middlewares.isAuthor(authorService),controller.delete)


const responseExists = Middlewares.checkDocumentExists(authorService,'responseId');

const responseCanRead = (req:express.Request, res:express.Response, next:express.NextFunction) => {
    const request : Helpers.Request = res.locals.request;
    console.log('\n\n\nresponseCanRead\n\n\n',request.getRaw(),'\n\n\n');
    next();
}

router.param('responseId',Middlewares.addParamToRequest());

router.use('/:responseId/comment',responseExists,responseCanRead,CommentRouter);
router.use('/:responseId/opinion',responseExists,responseCanRead,OpinionRouter);

export default router;