import { Router } from 'express';
import { Middlewares } from 'node-library';
import { AccessController,CommentController,OpinionController,QueryController,ResponseController } from '../controllers';

const router = Router()

router.post('/:userId/access/search',Middlewares.authCheck(false),AccessController.getAll)
router.post('/:userId/comment/search',Middlewares.authCheck(false),CommentController.getAll)
router.post('/:userId/opinion/search',Middlewares.authCheck(false),OpinionController.getAll)
router.post('/:userId/query/search',Middlewares.authCheck(false),QueryController.getAll)
router.post('/:userId/response/search',Middlewares.authCheck(false),ResponseController.getAll)

export default router;