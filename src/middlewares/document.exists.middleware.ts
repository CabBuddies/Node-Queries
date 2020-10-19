import * as express from 'express';
import { Helpers,Services } from "node-library";

function checkDocumentExists(service : Services.BaseService,paramName:string='id') {
    return async(req:express.Request, res:express.Response, next:express.NextFunction) => {
        const request : Helpers.Request = res.locals.request;
        try {
            if(await service.documentExists(request,req.params[paramName])){
                next();
                return;
            }
        } catch (error) {
            
        }
        res.status(404).send(paramName+' not found');
    }
}

export default checkDocumentExists;