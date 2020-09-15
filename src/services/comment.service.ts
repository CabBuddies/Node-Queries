import {CommentRepository} from '../repositories';
import {Helpers,Services} from 'node-library';
import {PubSubMessageTypes} from '../helpers/pubsub.helper';
import AuthorService from './author.service';
import { BinderNames } from '../helpers/binder.helper';

class CommentService extends AuthorService {

    private static instance: CommentService;
    
    private constructor() { 
        super(new CommentRepository());
    }

    public static getInstance(): CommentService {
        if (!CommentService.instance) {
            CommentService.instance = new CommentService();
        }

        return CommentService.instance;
    }

    create = async(request:Helpers.Request,bodyP) => {
        console.log('comment.service',request,bodyP);

        let {
            queryId,
            responseId,
            body,
            customAttributes
        } = bodyP

        if(queryId){
            const queryIdExists = await Services.Binder.boundFunction(BinderNames.QUERY.CHECK.ID_EXISTS)(request,queryId)
            console.log('comment.service','create','queryIdExists',queryIdExists)
            if(!queryIdExists)
                throw this.buildError(404,'queryId not available')
            responseId = undefined;
        }else if(responseId){
            const responseIdExists = await Services.Binder.boundFunction(BinderNames.RESPONSE.CHECK.ID_EXISTS)(request,responseId)
            console.log('comment.service','create','responseIdExists',responseIdExists)
            if(!responseIdExists)
                throw this.buildError(404,'responseId not available')
        }else{
            throw this.buildError(400,'queryId or responseId not provided')
        }

        let data :any = {
            author:request.getUserId(),
            queryId,
            responseId,
            body,
            customAttributes
        }

        data = Helpers.JSON.normalizeJson(data);

        console.log('comment.service','db insert',data);

        data = await this.repository.create(data);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.COMMENT.CREATED,
            data
        });

        console.log('comment.service','published message');

        return data;
    }

    update = async(request:Helpers.Request,entityId,bodyP) => {
        console.log('comment.service',request,bodyP);
        let {
            body,
            customAttributes
        } = bodyP

        let data :any = {
            body,
            customAttributes
        }

        data = Helpers.JSON.normalizeJson(data);

        console.log('comment.service','db update',data);

        data = await this.repository.updatePartial(entityId,data);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.COMMENT.UPDATED,
            data
        });

        return data;
    }

    delete = async(request:Helpers.Request,entityId) => {
        let data = await this.repository.delete(entityId)

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.COMMENT.DELETED,
            data
        });

        return data;
    }
}

export default CommentService.getInstance();