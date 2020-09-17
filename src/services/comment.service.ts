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

        if(bodyP.queryId){
            const queryIdExists = await Services.Binder.boundFunction(BinderNames.QUERY.CHECK.ID_EXISTS)(request,bodyP.queryId)
            console.log('comment.service','create','queryIdExists',queryIdExists)
            if(!queryIdExists)
                throw this.buildError(404,'queryId not available')
            delete bodyP.responseId;
        }else if(bodyP.responseId){
            const responseIdExists = await Services.Binder.boundFunction(BinderNames.RESPONSE.CHECK.ID_EXISTS)(request,bodyP.responseId)
            console.log('comment.service','create','responseIdExists',responseIdExists)
            if(!responseIdExists)
                throw this.buildError(404,'responseId not available')
        }else{
            throw this.buildError(400,'queryId or responseId not provided')
        }

        let data:any = bodyP;

        data.author = request.getUserId();

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

    update = async(request:Helpers.Request,documentId:string,bodyP) => {
        console.log('comment.service',request,bodyP);

        let data :any = bodyP;

        data = Helpers.JSON.normalizeJson(data);

        console.log('comment.service','db update',data);

        data = await this.repository.updatePartial(documentId,data);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.COMMENT.UPDATED,
            data
        });

        return data;
    }

    delete = async(request:Helpers.Request,documentId:string) => {
        let data = await this.repository.delete(documentId)

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.COMMENT.DELETED,
            data
        });

        return data;
    }
}

export default CommentService.getInstance();