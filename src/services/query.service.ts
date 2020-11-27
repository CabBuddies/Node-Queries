import {QueryRepository} from '../repositories';
import {Helpers,Services} from 'node-library';
import {PubSubMessageTypes} from '../helpers/pubsub.helper';
import AccessService from './access.service';
import { BinderNames } from '../helpers/binder.helper';
import StatsService from './stats.service';

class QueryService extends StatsService {

    private static instance: QueryService;
    
    private constructor() { 
        super(new QueryRepository());
        Services.Binder.bindFunction(BinderNames.QUERY.CHECK.ID_EXISTS,this.checkIdExists);

        Services.PubSub.Organizer.addSubscriber(PubSubMessageTypes.QUERY.READ,this);
        Services.PubSub.Organizer.addSubscriberAll(PubSubMessageTypes.OPINION,this);
        Services.PubSub.Organizer.addSubscriber(PubSubMessageTypes.RESPONSE.CREATED,this);
        Services.PubSub.Organizer.addSubscriber(PubSubMessageTypes.RESPONSE.DELETED,this);
        Services.PubSub.Organizer.addSubscriber(PubSubMessageTypes.COMMENT.CREATED,this);
        Services.PubSub.Organizer.addSubscriber(PubSubMessageTypes.COMMENT.DELETED,this);
    }

    public static getInstance(): QueryService {
        if (!QueryService.instance) {
            QueryService.instance = new QueryService();
        }

        return QueryService.instance;
    }

    processMessage(message: Services.PubSub.Message) {
        switch(message.type){
            case PubSubMessageTypes.QUERY.READ:
                this.queryRead(message.request,message.data);
                break;
            case PubSubMessageTypes.OPINION.CREATED:
                this.opinionCreated(message.request,message.data,'queryId');
                break;
            case PubSubMessageTypes.OPINION.DELETED:
                this.opinionDeleted(message.request,message.data,'queryId');
                break;
            case PubSubMessageTypes.RESPONSE.CREATED:
                this.responseCreated(message.request,message.data);
                break;
            case PubSubMessageTypes.RESPONSE.DELETED:
                this.responseDeleted(message.request,message.data);
                break;
            case PubSubMessageTypes.COMMENT.CREATED:
                this.commentCreated(message.request,message.data,'queryId');
                break;
            case PubSubMessageTypes.COMMENT.DELETED:
                this.commentDeleted(message.request,message.data,'queryId');
                break;
        }
    } 
    
    responseCreated(request: Helpers.Request, data: any) {        
        this.updateStat(request,data.queryId,"responseCount",true);
    }

    responseDeleted(request: Helpers.Request, data: any) {
        this.updateStat(request,data.queryId,"responseCount",false);
    }

    queryRead(request:Helpers.Request,data: any) {
        this.updateStat(request,data._id,"viewCount",true);
    }

    create = async(request:Helpers.Request,bodyP) => {
        console.log('query.service',request,bodyP);

        let data:any = bodyP;

        data.author = request.getUserId();
        data.status = data.status || 'draft';
        data.access = data.access || 'public';

        if(data.status === 'published'){
            data.draft = {
                title:'',
                body:'',
                tags:[]
            };
        }

        console.log('query.service','db insert',data);

        data.stats = {};

        data = await this.repository.create(data);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.QUERY.CREATED,
            data
        });

        console.log('query.service','published message');

        return (await this.embedAuthorInformation(request,[data],['author'],
        Services.Binder.boundFunction(BinderNames.USER.EXTRACT.USER_PROFILES)))[0];
    }

    getAll = async(request:Helpers.Request, query = {}, sort = {}, pageSize:number = 5, pageNum:number = 1, attributes:string[] = []) => {
        const exposableAttributes = ['author','published.title','published.tags','published.lastModifiedAt','createdAt','status','stats','access.type'];
        if(attributes.length === 0)
            attributes = exposableAttributes;
        else
            attributes = attributes.filter( function( el:string ) {
                return exposableAttributes.includes( el );
            });
        
        
        let restrictions = {};

        if(request.raw.params['userId'] && request.isUserAuthenticated()){
            restrictions = {"author":request.getUserId()};
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

        const data = await this.repository.get(documentId,attributes);

        if(!data)
            this.buildError(404);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.QUERY.READ,
            data
        });

        return (await this.embedAuthorInformation(request,[data],['author'],
        Services.Binder.boundFunction(BinderNames.USER.EXTRACT.USER_PROFILES)))[0];
    }

    update = async(request:Helpers.Request,documentId:string,bodyP) => {
        console.log('query.service',request,bodyP);

        let data :any = bodyP

        data[data.status].lastModifiedAt = new Date();

        if(data.status === 'published'){
            data.draft = {
                title:'',
                body:'',
                tags:[]
            };
        }else{
            delete data.status
        }

        //data = Helpers.JSON.normalizeJson(data);

        console.log('query.service','db update',data);

        data = await this.repository.updatePartial(documentId,data);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.QUERY.UPDATED,
            data
        });

        return (await this.embedAuthorInformation(request,[data],['author'],
        Services.Binder.boundFunction(BinderNames.USER.EXTRACT.USER_PROFILES)))[0];
    }

    delete = async(request:Helpers.Request,documentId:string) => {
        let data :any = {
            status:'deleted'
        }

        data = await this.repository.updatePartial(documentId,data);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.QUERY.DELETED,
            data
        });

        return (await this.embedAuthorInformation(request,[data],['author'],
        Services.Binder.boundFunction(BinderNames.USER.EXTRACT.USER_PROFILES)))[0];
    }

    deepEqual =  (x, y) => {
        if (x === y) {
          return true;
        }
        else if ((typeof x == "object" && x != null) && (typeof y == "object" && y != null)) {
          if (Object.keys(x).length != Object.keys(y).length)
            return false;
      
          for (var prop in x) {
            if (y.hasOwnProperty(prop))
            {  
              if (! this.deepEqual(x[prop], y[prop]))
                return false;
            }
            else
              return false;
          }
      
          return true;
        }
        else 
          return false;
      }

}

export default QueryService.getInstance();