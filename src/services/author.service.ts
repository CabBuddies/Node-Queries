import {Helpers,Services} from 'node-library';
import { AuthorRepository } from '../repositories';
import {PubSubMessageTypes} from '../helpers/pubsub.helper';

class AuthorService extends Services.BaseService {

    constructor(repository : AuthorRepository) { 
        super(repository);
    }

    isAuthor = async(request:Helpers.Request, entityId) => {
        return await this.repository.isAuthor(entityId,request.getUserId());
    }

    checkIdExists = async(request:Helpers.Request,id) => {
        try {
            const result = await this.repository.get(id);
            console.log('AuthorService','checkIdExists',result);
            if(result)
                return result._id.toString() === id;
        } catch (error) {
            console.log(error)
        }
        return false;
    }
/*
    checkEntityId = async(request:Helpers.Request,type,entityId) => {
        console.log('checkEntityId',entityId)
        if(entityId){
            let responses = await Services.PubSub.Organizer.publishMessage({
                request,
                type,
                data:entityId
            })
            
            console.log('checkEntityId',responses);

            let success = false;

            for(const m of responses){
                if(m){
                    if(m.data){
                        success = true;
                    }
                }
            }

            if(!success)
                throw this.buildError(404);
        }else{
            console.log('entityId unavailable')
            throw this.buildError(400,'entityId unavailable');
        }
    }

    checkQueryId = async(request:Helpers.Request,queryId) => {
        console.log('checkQueryId',queryId)
        this.checkEntityId(request,PubSubMessageTypes.QUERY.CHECK.ID_EXISTS,queryId);
    }


    checkResponseId = async(request:Helpers.Request,responseId) => {
        console.log('checkResponseId',responseId)
        this.checkEntityId(request,PubSubMessageTypes.RESPONSE.CHECK.ID_EXISTS,responseId);
    }
*/
}

export default AuthorService;