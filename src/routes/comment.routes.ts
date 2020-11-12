import { Router } from 'express';
import { Middlewares , Services} from 'node-library';
import { CommentController } from '../controllers';

const router = Router()

const controller = new CommentController();

const authorService : Services.AuthorService = <Services.AuthorService> (controller.service);

const validatorMiddleware = new Middlewares.ValidatorMiddleware();

router.post('/',Middlewares.authCheck(true),validatorMiddleware.validateRequestBody({
    "type": "object",
    "additionalProperties": false,
    "required": ["body"],
    "properties": {
        "body":{
            "type":"string"
        },
        "customAttributes":{
            "type":"object"
        }
    }
}),controller.create)

router.post('/search',Middlewares.authCheck(false),controller.getAll)

router.get('/:id',Middlewares.authCheck(false),controller.get)

router.put('/:id',Middlewares.authCheck(true),Middlewares.isAuthor(authorService),validatorMiddleware.validateRequestBody({
    "type": "object",
    "additionalProperties": false,
    "required": ["body"],
    "properties": {
        "body":{
            "type":"string"
        },
        "customAttributes":{
            "type":"object"
        }
    }
}),controller.update)

router.delete('/:id',Middlewares.authCheck(true),Middlewares.isAuthor(authorService),controller.delete)


export default router;