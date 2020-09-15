import { Router } from 'express';
import { Middlewares } from 'node-library';
import { OpinionController } from '../controllers';
import { isAuthor } from '../middlewares';
import { AuthorService } from '../services';

const router = Router()

const controller = new OpinionController();

const authorService : AuthorService = <AuthorService> (controller.service);

router.post('/',Middlewares.authCheck(true),controller.create)
router.get('/',Middlewares.authCheck(false),controller.getAll)
router.get('/:id',Middlewares.authCheck(false),controller.get)
router.delete('/:id',Middlewares.authCheck(true),isAuthor(authorService),controller.delete)

export default router;