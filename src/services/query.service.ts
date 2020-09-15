import {QueryRepository} from '../repositories';
import {Helpers,Services} from 'node-library';
import {PubSubMessageTypes} from '../helpers/pubsub.helper';
import StatsService from './stats.service';
import { BinderNames } from '../helpers/binder.helper';

class QueryService extends StatsService {

    private static instance: QueryService;
    
    private constructor() { 
        super(new QueryRepository());
        Services.Binder.bindFunction(BinderNames.QUERY.CHECK.ID_EXISTS,this.checkIdExists);
    }

    public static getInstance(): QueryService {
        if (!QueryService.instance) {
            QueryService.instance = new QueryService();
        }

        return QueryService.instance;
    }

    create = async(request:Helpers.Request,bodyP) => {
        console.log('query.service',request,bodyP);

        // let {
        //     title,
        //     body,
        //     tags,
        //     customAttributes,
        //     status
        // } = bodyP

        // status = status || 'draft';

        // if(['draft','published'].indexOf(status) === -1){
        //     throw this.buildError(400);
        // }

        // let data :any = {
        //     author:request.getUserId(),
        //     customAttributes,
        //     status,
        //     stats:{}
        // }

        // data[status] = {
        //     title,
        //     body,
        //     tags,
        //     lastModifiedAt:Date.now()
        // }

        bodyP = Helpers.JSON.normalizeJson(bodyP);

        bodyP.author = request.getUserId();

        console.log('query.service','db insert',bodyP);

        const data = await this.repository.create(bodyP);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.QUERY.CREATED,
            data
        });

        console.log('query.service','published message');

        return data;
    }

    update = async(request:Helpers.Request,entityId,bodyP) => {
        console.log('query.service',request,bodyP);
        let {
            title,
            body,
            tags,
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
                tags,
                lastModifiedAt:new Date()
            }
            
        }

        data = Helpers.JSON.normalizeJson(data);

        console.log('query.service','db update',data);

        data = await this.repository.updatePartial(entityId,data);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.QUERY.UPDATED,
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
            type:PubSubMessageTypes.QUERY.DELETED,
            data
        });

        return data;
    }

}

export default QueryService.getInstance();