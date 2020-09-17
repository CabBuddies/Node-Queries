import { Router } from 'express';
import { Middlewares } from 'node-library';
import { OpinionController } from '../controllers';
import { isAuthor } from '../middlewares';
import { AuthorService } from '../services';

const router = Router()

const controller = new OpinionController();

const authorService : AuthorService = <AuthorService> (controller.service);

router.post('/',Middlewares.authCheck(true),Middlewares.validateRequestBody([
    {name:'queryId',type:'string',optional:true},
    {name:'responseId',type:'string',optional:true},
    {name:'body',type:'string',optional:true},
    {name:'opinionType',type:'string',trim:true,lower:true,defaultValue:'upvote',anyOf:['follow','upvote','downvote','spamreport']},
    {name:'customAttributes',type:'any',optional:true}
]),controller.create)

router.get('/',Middlewares.authCheck(false),controller.getAll)

router.get('/:id',Middlewares.authCheck(false),controller.get)

router.delete('/:id',Middlewares.authCheck(true),isAuthor(authorService),controller.delete)

export default router;