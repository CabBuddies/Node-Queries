import {OpinionRepository} from '../repositories';
import {Helpers,Services} from 'node-library';
import {PubSubMessageTypes} from '../helpers/pubsub.helper';
import { BinderNames } from '../helpers/binder.helper';
import { JSON } from 'node-library/lib/helpers';

class OpinionService extends Services.AuthorService {

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


    getAll = async(request:Helpers.Request, query = {}, sort = {}, pageSize:number = 5, pageNum:number = 1, attributes:string[] = []) => {
        const exposableAttributes = ['author','queryId','responseId','body','createdAt','opinionType'];
        if(attributes.length === 0)
            attributes = exposableAttributes;
        else
            attributes = attributes.filter( function( el:string ) {
                return exposableAttributes.includes( el );
            });

        let restrictions = {};

        const queryId = request.raw.params['queryId'];
        const responseId = request.raw.params['responseId']||'none';

        if(queryId && responseId){
            restrictions = {
                $and:[
                    {"queryId":queryId},
                    {"responseId":responseId}
                ]
            }
        }else if(request.isUserAuthenticated()){
            restrictions = {"author":request.getUserId()};
        }else{
            this.buildError(404);
        }

        query = {
            "$and":[
                query,
                restrictions
            ]
        };    

        const data = await this.repository.getAll(query,sort,pageSize,pageNum,attributes);

        data.result = await this.embedAuthorInformation(request,data.result,['author'],
        Services.Binder.boundFunction(BinderNames.USER.EXTRACT.USER_PROFILES));

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