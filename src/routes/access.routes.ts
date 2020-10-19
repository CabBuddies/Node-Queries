import { Router } from 'express';
import { Middlewares } from 'node-library';
import { AccessController } from '../controllers';
import { isAuthor } from '../middlewares';
import { AuthorService } from '../services';

const router = Router()

const controller = new AccessController();

const authorService : AuthorService = <AuthorService> (controller.service);

const validatorMiddleware = new Middlewares.ValidatorMiddleware();

router.post('/',Middlewares.authCheck(true),validatorMiddleware.validateRequestBody({
    "type": "object",
    "additionalProperties": false,
    "required": ["queryId","userId","status"],
    "properties": {
        "queryId":{
            "type":"string"
        },
        "userId":{
            "type":"string"
        },
        "status":{
            "type":"string",
            "enum":["granted","revoked","requested"]
        },
        "customAttributes":{
            "type":"object"
        }
    }
}),controller.create)

router.get('/',Middlewares.authCheck(false),controller.getAll)

router.get('/:id',Middlewares.authCheck(false),controller.get)

router.put('/:id',Middlewares.authCheck(true),isAuthor(authorService),validatorMiddleware.validateRequestBody({
    "type": "object",
    "additionalProperties": false,
    "required": ["status"],
    "properties": {
        "status":{
            "type":"string",
            "enum":["granted","revoked","requested"]
        },
        "customAttributes":{
            "type":"object"
        }
    }
}),controller.update)

router.delete('/:id',Middlewares.authCheck(true),isAuthor(authorService),controller.delete)


export default router;