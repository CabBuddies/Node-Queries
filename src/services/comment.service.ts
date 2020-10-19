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

    create = async(request:Helpers.Request,data) => {
        console.log('comment.service',request,data);

        data.queryId = request.raw.params['queryId'];
        data.responseId = request.raw.params['responseId']||'none';

        data.author = request.getUserId();

        data = Helpers.JSON.normalizeJson(data);

        console.log('comment.service','db insert',data);

        data = await this.repository.create(data);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.COMMENT.CREATED,
            data
        });

        console.log('comment.service','published message');

        return (await this.embedAuthorInformation(request,[data]))[0];
    }

    getAll = async(request:Helpers.Request, query = {}, sort = {}, pageSize:number = 5, pageNum:number = 1, attributes:string[] = []) => {
        const exposableAttributes = ['author','queryId','published.title','published.tags','published.lastModifiedAt','createdAt','status','stats','access.type'];
        if(attributes.length === 0)
            attributes = exposableAttributes;
        else
            attributes = attributes.filter( function( el:string ) {
                return exposableAttributes.includes( el );
            });

        const queryId = request.raw.params['queryId'];
        const responseId = request.raw.params['responseId']||'none';

        query = {
            "$and":[
                query,{"queryId":queryId},{"responseId":responseId}
            ]
        };    

        const data = await this.repository.getAll(query,sort,pageSize,pageNum,attributes);

        data.result = await this.embedAuthorInformation(request,data.result);

        return data;
    }

    get = async(request:Helpers.Request, documentId: string, attributes?: any[]) => {
        
        const queryId = request.raw.params['queryId'];
        const responseId = request.raw.params['responseId']||'none';

        const query :any = {
            queryId,
            responseId,
            _id:documentId
        };

        const data = await this.repository.getOne(query,attributes);

        if(!data)
            this.buildError(404);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.COMMENT.READ,
            data
        });

        return (await this.embedAuthorInformation(request,[data]))[0];
    }

    update = async(request:Helpers.Request,documentId:string,data) => {
        console.log('comment.service',request,data);

        const queryId = request.raw.params['queryId'];
        const responseId = request.raw.params['responseId']||'none';

        const query :any = {
            queryId,
            responseId,
            _id:documentId
        };

        data = Helpers.JSON.normalizeJson(data);

        console.log('comment.service','db update',data);

        data = await this.repository.updateOnePartial(query,data);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.COMMENT.UPDATED,
            data
        });

        return (await this.embedAuthorInformation(request,[data]))[0];
    }

    delete = async(request:Helpers.Request,documentId:string) => {
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
            type:PubSubMessageTypes.COMMENT.DELETED,
            data
        });

        return (await this.embedAuthorInformation(request,[data]))[0];
    }
}

export default CommentService.getInstance();