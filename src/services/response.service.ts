import {ResponseRepository} from '../repositories';
import {Helpers,Services} from 'node-library';
import {PubSubMessageTypes} from '../helpers/pubsub.helper';
import StatsService from './stats.service';
import { BinderNames } from '../helpers/binder.helper';

class ResponseService extends StatsService {

    private static instance: ResponseService;
    
    private constructor() { 
        super(new ResponseRepository());
        Services.Binder.bindFunction(BinderNames.RESPONSE.CHECK.ID_EXISTS,this.checkIdExists);
        Services.PubSub.Organizer.addSubscriberAll(PubSubMessageTypes.OPINION,this);
        Services.PubSub.Organizer.addSubscriber(PubSubMessageTypes.COMMENT.CREATED,this);
        Services.PubSub.Organizer.addSubscriber(PubSubMessageTypes.COMMENT.DELETED,this);
    }

    public static getInstance(): ResponseService {
        if (!ResponseService.instance) {
            ResponseService.instance = new ResponseService();
        }

        return ResponseService.instance;
    }


    processMessage(message: Services.PubSub.Message) {
        switch(message.type){
            case PubSubMessageTypes.OPINION.CREATED:
                this.opinionCreated(message.request,message.data,'responseId');
                break;
            case PubSubMessageTypes.OPINION.DELETED:
                this.opinionDeleted(message.request,message.data,'responseId');
                break;
            case PubSubMessageTypes.COMMENT.CREATED:
                this.commentCreated(message.request,message.data,'responseId');
                break;
            case PubSubMessageTypes.COMMENT.DELETED:
                this.commentDeleted(message.request,message.data,'responseId');
                break;
        }
    } 

    create = async(request:Helpers.Request,data) => {
        console.log('response.service',request,data);

        data.queryId = request.raw.params['queryId'];

        data.author = request.getUserId();

        if(data.status === 'published'){
            data.draft = {
                title:'',
                body:'',
                media:[]
            };
        }

        console.log('query.service','db insert',data);

        data.stats = {};
        
        data = await this.repository.create(data);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.RESPONSE.CREATED,
            data
        });

        console.log('query.service','published message');

        return (await this.embedAuthorInformation(request,[data],['author'],
        Services.Binder.boundFunction(BinderNames.USER.EXTRACT.USER_PROFILES)))[0];
    }

    getAll = async(request:Helpers.Request, query = {}, sort = {}, pageSize:number = 5, pageNum:number = 1, attributes:string[] = []) => {
        const exposableAttributes = ['author','queryId','published.title','published.body','published.tags','published.lastModifiedAt','createdAt','status','stats','access.type'];
        if(attributes.length === 0)
            attributes = exposableAttributes;
        else
            attributes = attributes.filter( function( el:string ) {
                return exposableAttributes.includes( el );
            });


        let restrictions = {};

        if(request.raw.params['queryId']){
            restrictions = {"queryId":request.raw.params['queryId']};
        }else if(request.isUserAuthenticated()){
            restrictions = {"author":request.getUserId()};
        }else {
            this.buildError(404);
        }

        query = {
            $and:[
                query,
                restrictions
            ]
        };

        const data = await this.repository.getAll(query,sort,pageSize,pageNum,attributes);

        data.result = await this.embedAuthorInformation(request,data.result,['author'],
        Services.Binder.boundFunction(BinderNames.USER.EXTRACT.USER_PROFILES));

        return data;
    }

    get = async(request:Helpers.Request, documentId: string, attributes?: any[]) => {

        const query = {
            queryId:request.raw.params['queryId'],
            _id:documentId
        };

        const data = await this.repository.getOne(query,attributes);

        if(!data)
            this.buildError(404);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.RESPONSE.READ,
            data
        });

        return (await this.embedAuthorInformation(request,[data],['author'],
        Services.Binder.boundFunction(BinderNames.USER.EXTRACT.USER_PROFILES)))[0];
    }

    update = async(request:Helpers.Request,documentId,data) => {
        console.log('response.service',request,data);
        
        const query = {
            queryId:request.raw.params['queryId'],
            _id:documentId
        };

        data[data.status].lastModifiedAt = new Date();

        if(data.status === 'published'){
            data.draft = {
                title:'',
                body:'',
                media:[]
            };
        }else{
            delete data.status
        }

        //data = Helpers.JSON.normalizeJson(data);

        console.log('response.service','db update',data);

        data = await this.repository.updateOnePartial(query,data);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.RESPONSE.UPDATED,
            data
        });

        return (await this.embedAuthorInformation(request,[data],['author'],
        Services.Binder.boundFunction(BinderNames.USER.EXTRACT.USER_PROFILES)))[0];
    }

    delete = async(request:Helpers.Request,documentId) => {
        let data :any = {
            status:'deleted'
        }

        const query = {
            queryId:request.raw.params['queryId'],
            _id:documentId
        };

        data = await this.repository.updateOnePartial(query,data);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.RESPONSE.DELETED,
            data
        });

        return (await this.embedAuthorInformation(request,[data],['author'],
        Services.Binder.boundFunction(BinderNames.USER.EXTRACT.USER_PROFILES)))[0];
    }
}

export default ResponseService.getInstance();