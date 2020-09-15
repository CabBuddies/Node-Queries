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

        let {
            queryId,
            title,
            body,
            customAttributes,
            status
        } = bodyP

        if(!queryId)
            throw this.buildError(400);

        const queryIdExists = await Services.Binder.boundFunction(BinderNames.QUERY.CHECK.ID_EXISTS)(request,queryId)

        console.log('response.service','queryIdExists',queryIdExists);

        if(!queryIdExists)
            throw this.buildError(404);


        status = status || 'draft';

        if(['draft','published'].indexOf(status) === -1){
            throw this.buildError(400);
        }

        let data :any = {
            author:request.getUserId(),
            queryId,
            customAttributes,
            status,
            stats:{}
        }

        data[status] = {
            title,
            body,
            lastModifiedAt:Date.now()
        }

        data = Helpers.JSON.normalizeJson(data);

        console.log('response.service','db insert',data);

        data = await this.repository.create(data);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.RESPONSE.CREATED,
            data
        });

        console.log('response.service','published message');

        return data;
    }

    update = async(request:Helpers.Request,entityId,bodyP) => {
        console.log('response.service',request,bodyP);
        let {
            title,
            body,
            customAttributes,
            status
        } = bodyP

        let data :any = {
            customAttributes
        }

        if(status){

            if(['draft','published'].indexOf(status) === -1){
                throw this.buildError(400);
            }

            if(status === 'published'){
                data.status = 'published';
                data.draft = {
                    title:'',
                    body:'',
                    tags:[],
                    lastModifiedAt:new Date()
                };
            }

            data[status] = {
                title,
                body,
                lastModifiedAt:new Date()
            }
            
        }

        data = Helpers.JSON.normalizeJson(data);

        console.log('response.service','db update',data);

        data = await this.repository.updatePartial(entityId,data);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.RESPONSE.UPDATED,
            data
        });

        return data;
    }

    delete = async(request:Helpers.Request,entityId) => {
        let data :any = {
            status:'deleted'
        }

        data = await this.repository.updatePartial(entityId,data);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.RESPONSE.DELETED,
            data
        });

        return data;
    }
}

export default ResponseService.getInstance();