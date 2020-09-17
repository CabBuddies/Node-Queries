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
    }

    public static getInstance(): ResponseService {
        if (!ResponseService.instance) {
            ResponseService.instance = new ResponseService();
        }

        return ResponseService.instance;
    }

    create = async(request:Helpers.Request,bodyP) => {
        console.log('response.service',request,bodyP);

        const queryIdExists = await Services.Binder.boundFunction(BinderNames.QUERY.CHECK.ID_EXISTS)(request,bodyP.queryId)

        console.log('response.service','responseIdExists',queryIdExists);

        if(!queryIdExists)
            throw this.buildError(404);

        let data:any = bodyP;

        data.author = request.getUserId();

        if(data.status === 'published'){
            data.draft = {
                title:'',
                body:''
            };
        }

        console.log('query.service','db insert',data);

        data = await this.repository.create(data);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.RESPONSE.CREATED,
            data
        });

        console.log('query.service','published message');

        return data;
    }

    getAll = async(request:Helpers.Request, query = {}, sort = {}, pageSize:number = 5, pageNum:number = 1, attributes:string[] = []) => {
        const exposableAttributes = ['author','queryId','published.title','published.tags','published.lastModifiedAt','createdAt','status','stats','access.type'];
        if(attributes.length === 0)
            attributes = exposableAttributes;
        else
            attributes = attributes.filter( function( el:string ) {
                return exposableAttributes.includes( el );
            });
        return this.repository.getAll(query,sort,pageSize,pageNum,attributes);
    }

    update = async(request:Helpers.Request,documentId,bodyP) => {
        console.log('response.service',request,bodyP);
        let data :any = bodyP

        if(data.status === 'published'){
            data.draft = {
                title:'',
                body:''
            };
        }else{
            delete data.status
        }

        data[data.status] = {
            lastModifiedAt:new Date()
        }

        //data = Helpers.JSON.normalizeJson(data);

        console.log('response.service','db update',data);

        data = await this.repository.updatePartial(documentId,data);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.RESPONSE.UPDATED,
            data
        });

        return data;
    }

    delete = async(request:Helpers.Request,documentId) => {
        let data :any = {
            status:'deleted'
        }

        data = await this.repository.updatePartial(documentId,data);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.RESPONSE.DELETED,
            data
        });

        return data;
    }
}

export default ResponseService.getInstance();