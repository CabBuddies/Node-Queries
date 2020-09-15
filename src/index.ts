require('module-alias/register')
import * as express from 'express';
import app from './startup/app';
import {Config} from 'node-library';
import * as routes from './routes';

startServer();

function startServer(){
    const router :express.Router = express.Router()

    router.use('/query',routes.QueryRoutes);
    router.use('/response',routes.ResponseRoutes);
    router.use('/comment',routes.CommentRoutes);
    router.use('/tag',routes.TagRoutes);
    router.use('/opinion',routes.OpinionRoutes);
    
    app.use('/api/v1',router);
    
    app.listen(Config.PORT,()=>{
        console.log('app listening',Config.PORT);
    })
    
    Config.routesList(app);
}