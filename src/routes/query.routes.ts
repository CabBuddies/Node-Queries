import { Router } from 'express';
import { Helpers, Middlewares } from 'node-library';
import { QueryController } from '../controllers';
import { isAuthor } from '../middlewares';
import { AuthorService } from '../services';

const { checkSchema } = require('express-validator');

const router = Router()

const controller = new QueryController();

const authorService : AuthorService = <AuthorService> (controller.service);

router.post('/',Middlewares.authCheck(true),Middlewares.validateRequestBody([
    {name:'status',type:'string',trim:true,lower:true,defaultValue:'draft',anyOf:['draft','published']},
    {name:'draft.title',type:'string',min:2,max:140,trim:true,optional:true},
    {name:'draft.body',type:'string',min:2,max:500,trim:true,optional:true},
    {name:'draft.tags',type:'array',array_defaultValue:[],array_unique:true,array_normalize:true,array_item_type:'string',trim:true,lower:true,optional:true},
    {name:'published.title',type:'string',min:2,max:140,trim:true,optional:true},
    {name:'published.body',type:'string',min:2,max:500,trim:true,optional:true},
    {name:'published.tags',type:'array',array_defaultValue:[],array_unique:true,array_normalize:true,array_item_type:'string',trim:true,lower:true,optional:true},
    {name:'customAttributes',type:'any',optional:true}
]),controller.create)

router.get('/',Middlewares.authCheck(false),controller.getAll)

router.get('/:id',Middlewares.authCheck(false),controller.get)

router.put('/:id',Middlewares.authCheck(true),isAuthor(authorService),Middlewares.validateRequestBody([
    {name:'status',type:'string',trim:true,lower:true,defaultValue:'draft',anyOf:['draft','published']},
    {name:'draft.title',type:'string',min:2,max:140,trim:true,optional:true},
    {name:'draft.body',type:'string',min:2,max:500,trim:true,optional:true},
    {name:'draft.tags',type:'array',array_defaultValue:[],array_unique:true,array_normalize:true,array_item_type:'string',trim:true,lower:true,optional:true},
    {name:'published.title',type:'string',min:2,max:140,trim:true,optional:true},
    {name:'published.body',type:'string',min:2,max:500,trim:true,optional:true},
    {name:'published.tags',type:'array',array_defaultValue:[],array_unique:true,array_normalize:true,array_item_type:'string',trim:true,lower:true,optional:true},
    {name:'customAttributes',type:'any',optional:true}
]),controller.update)

router.delete('/:id',Middlewares.authCheck(true),isAuthor(authorService),controller.delete)

export default router;