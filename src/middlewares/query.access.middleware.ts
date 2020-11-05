import * as express from 'express';
import { Helpers,Services } from "node-library";
import { AccessService } from "../services";

function canAccessQuery(paramName:string='id') {
    return async (req:express.Request, res:express.Response, next:express.NextFunction) => {
        const request : Helpers.Request = res.locals.request;
        console.log('\n\n\nqueryCanRead\n\n\n',request.getRaw(),'\n\n\n');
        //queryId
        //request.getUserId()

        const queryId = request.raw.params[paramName];
        const userId = request.getUserId();

        const allow = await AccessService.canUserAccessQuery(request,userId,queryId);

        if(allow){
            next();
        }else{
            res.status(403).send('cannot access the query or its children');
        }
    }    
}

export default canAccessQuery;