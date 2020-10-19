import {OpinionRepository} from '../repositories';
import {Helpers,Services} from 'node-library';
import {PubSubMessageTypes} from '../helpers/pubsub.helper';
import AuthorService from './author.service';
import { BinderNames } from '../helpers/binder.helper';
import { JSON } from 'node-library/lib/helpers';

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

        data.queryId = request.raw.params['queryId'];
        data.responseId = request.raw.params['responseId']||'none';

        data.author = request.getUserId();

        let response = await this.getAll(request,JSON.normalizeJson({
            author:data.author,
            queryId:data.queryId,
            responseId:data.responseId,
        }),{},1000);

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


    delete = async(request:Helpers.Request,documentId) => {
        const queryId = request.raw.params['queryId'];
        const responseId = request.raw.params['responseId']||'none';

        const query :any = {
            queryId,
            responseId,
            _id:documentId
        };

        let data = await this.repository.deleteOne(query);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.OPINION.DELETED,
            data
        });

        return data;
    }
}

export default OpinionService.getInstance();