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

    create = async(request:Helpers.Request,data) => {
        console.log('opinion.service',request,data);

        if(data.queryId){
            const queryIdExists = await Services.Binder.boundFunction(BinderNames.QUERY.CHECK.ID_EXISTS)(request,data.queryId)
            if(!queryIdExists)
                throw this.buildError(404,'queryId not available')
            delete data.responseId;
        }else if(data.responseId){
            const responseIdExists = await Services.Binder.boundFunction(BinderNames.RESPONSE.CHECK.ID_EXISTS)(request,data.responseId)
            if(!responseIdExists)
                throw this.buildError(404,'responseId not available')
        }else{
            throw this.buildError(400,'queryId or responseId not provided')
        }

        data.author = request.getUserId();

        let response = await this.getAll(request,{
            author:data.author,
            queryId:data.queryId,
            responseId:data.responseId,
        },100);

        if(response.resultSize>0){
            for(const opinion of response.result){
                if(data.opinionType === opinion.opinionType){
                    throw this.buildError(200,opinion);
                }
                if(
                    (data.opinionType === 'upvote' && opinion.opinionType === 'downvote')
                    ||
                    (data.opinionType === 'downvote' && opinion.opinionType === 'upvote')
                ){
                    await this.delete(request,opinion._id);
                }
            }
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