import {OpinionRepository} from '../repositories';
import {Helpers,Services} from 'node-library';
import {PubSubMessageTypes} from '../helpers/pubsub.helper';
import AuthorService from './author.service';
import { BinderNames } from '../helpers/binder.helper';

class OpinionService extends AuthorService {

    private static instance: OpinionService;
    
    private constructor() { 
        super(new OpinionRepository());
    }

    public static getInstance(): OpinionService {
        if (!OpinionService.instance) {
            OpinionService.instance = new OpinionService();
        }

        return OpinionService.instance;
    }

    create = async(request:Helpers.Request,bodyP) => {
        console.log('opinion.service',request,bodyP);

        let {
            queryId,
            responseId,
            body,
            opinionType,
            customAttributes
        } = bodyP

        if(queryId){
            const queryIdExists = await Services.Binder.boundFunction(BinderNames.QUERY.CHECK.ID_EXISTS)(request,queryId)
            if(!queryIdExists)
                throw this.buildError(404,'queryId not available')
            responseId = undefined;
        }else if(responseId){
            const responseIdExists = await Services.Binder.boundFunction(BinderNames.RESPONSE.CHECK.ID_EXISTS)(request,responseId)
            if(!responseIdExists)
                throw this.buildError(404,'responseId not available')
        }else{
            throw this.buildError(400,'queryId or responseId not provided')
        }

        let response = await this.getAll(request,{
            author:request.getUserId(),
            queryId,
            responseId,
        },100);

        if(response.resultSize>0){
            for(const opinion of response.result){
                if(opinionType === opinion.opinionType){
                    throw this.buildError(200,opinion);
                }
                if(
                    (opinionType === 'upvote' && opinion.opinionType === 'downvote')
                    ||
                    (opinionType === 'downvote' && opinion.opinionType === 'upvote')
                ){
                    await this.delete(request,opinion._id);
                }
            }
        }

        let data :any = {
            author:request.getUserId(),
            queryId,
            responseId,
            body,
            opinionType,
            customAttributes
        }

        data = Helpers.JSON.normalizeJson(data);

        console.log('opinion.service','db insert',data);

        data = await this.repository.create(data);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.OPINION.CREATED,
            data
        });

        console.log('opinion.service','published message');

        return data;
    }


    delete = async(request:Helpers.Request,entityId) => {
        let data = await this.repository.delete(entityId)

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.OPINION.DELETED,
            data
        });

        return data;
    }
}

export default OpinionService.getInstance();