import {Helpers,Services} from 'node-library';
import { AccessRepository } from '../repositories';
import {PubSubMessageTypes} from '../helpers/pubsub.helper';
import AuthorService from './author.service';
import { BinderNames } from '../helpers/binder.helper';

class AccessService extends AuthorService {

    private static instance: AccessService;
    
    private constructor() { 
        super(new AccessRepository());
    }

    public static getInstance(): AccessService {
        if (!AccessService.instance) {
            AccessService.instance = new AccessService();
        }

        return AccessService.instance;
    }


    create = async(request:Helpers.Request,data) => {
        console.log('access.service',request,data);

        const query = await Services.Binder.boundFunction(BinderNames.QUERY.CHECK.ID_EXISTS)(request,data.queryId);
        console.log('access.service','create','query',query);
        if(!query)
            throw this.buildError(404,'query not available');

        data.author = request.getUserId();

        if(query.author !== data.author)
            throw this.buildError(403,'query author mismatch');

        console.log('access.service','db insert',data);

        data = await this.repository.create(data);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.ACCESS.CREATED,
            data
        });

        console.log('access.service','published message');

        return (await this.embedAuthorInformation(request,[data],['author','userId']))[0];
    }

    getAll = async(request:Helpers.Request, query = {}, sort = {}, pageSize:number = 5, pageNum:number = 1, attributes:string[] = []) => {
        const exposableAttributes = ['author','queryId','userId','lastModifiedAt','createdAt','status'];
        if(attributes.length === 0)
            attributes = exposableAttributes;
        else
            attributes = attributes.filter( function( el:string ) {
                return exposableAttributes.includes( el );
            });
        
        query['author'] = request.getUserId();

        const data = await this.repository.getAll(query,sort,pageSize,pageNum,attributes);

        data.result = await this.embedAuthorInformation(request,data.result,['author','userId']);

        return data;
    }

    get = async(request:Helpers.Request, documentId: string, attributes?: any[]) => {

        const data = await this.repository.getAccessDocument(documentId,request.getUserId());

        if(!data)
            this.buildError(404);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.ACCESS.READ,
            data
        });

        return (await this.embedAuthorInformation(request,[data],['author','userId']))[0];
    }

    update = async(request:Helpers.Request,documentId:string,data) => {
        console.log('access.service',request,data);

        data = Helpers.JSON.normalizeJson(data);

        console.log('access.service','db update',data);

        data = await this.repository.updatePartial(documentId,data);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.ACCESS.UPDATED,
            data
        });

        return (await this.embedAuthorInformation(request,[data],['author','userId']))[0];
    }

    delete = async(request:Helpers.Request,documentId:string) => {
        let data = await this.repository.delete(documentId)

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.ACCESS.DELETED,
            data
        });

        return (await this.embedAuthorInformation(request,[data],['author','userId']))[0];
    }

}

export default AccessService.getInstance();