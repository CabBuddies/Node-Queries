import { Router } from 'express';
import { Middlewares } from 'node-library';
import { CommentController } from '../controllers';
import { isAuthor } from '../middlewares';
import { AuthorService } from '../services';

const router = Router()

const controller = new CommentController();

const authorService : AuthorService = <AuthorService> (controller.service);

router.post('/',Middlewares.authCheck(true),Middlewares.validateRequestBody([
    {name:'queryId',type:'string',optional:true},
    {name:'responseId',type:'string',optional:true},
    {name:'body',type:'string'},
    {name:'customAttributes',type:'any',optional:true}
]),controller.create)

router.get('/',Middlewares.authCheck(false),controller.getAll)

router.get('/:id',Middlewares.authCheck(false),controller.get)

router.put('/:id',Middlewares.authCheck(true),isAuthor(authorService),Middlewares.validateRequestBody([
    {name:'body',type:'string'},
    {name:'customAttributes',type:'any',optional:true}
]),controller.update)

router.delete('/:id',Middlewares.authCheck(true),isAuthor(authorService),controller.delete)


export default router;