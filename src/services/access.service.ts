import {Helpers,Services} from 'node-library';
import { AccessRepository } from '../repositories';
import {PubSubMessageTypes} from '../helpers/pubsub.helper';
import { BinderNames } from '../helpers/binder.helper';

class AccessService extends Services.AuthorService {

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

    canUserAccessQuery = async(request:Helpers.Request, userId:string, queryId:string) => {
        
        //extract query from database

        const query = await Services.Binder.boundFunction(BinderNames.QUERY.CHECK.ID_EXISTS)(request,queryId);
        
        console.log('access.service','canUserAccessQuery','query',query);
        
        if(!query)
            throw this.buildError(404,'query not available');

        //check if the query of queryId is public

        if(query.access === "public"){
            console.log('query is public, so you can access it');
            return true;
        }
        //if not
        //check if the userId exists

        if(!userId){
            console.log('query is not public, so you cant access it without auth');
            return false;
        }
        //if not
        //if requestor is the query author

        if(query.author === userId){
            console.log('query is not public, but you are its author so you can access it');
            return true;
        }
        //if not
        //check if query access is followers

        if(query.access === "followers"){
            const followerRule = await Services.Binder.boundFunction(BinderNames.USER_RELATION.CHECK.IS_FOLLOWER)(query.author,userId);
            if(followerRule){
                console.log('query access type is followers, and you are a follower of the query author',followerRule);
                return true;
            }
            console.log('query access type is followers, and you are not a follower of the query author','but still you could have a chance with access rules');
        }

        //if not
        //search for access rules that are in this format : {"queryId":queryId,userId:request.getUserId(),"status":"granted"}

        const _query = {};

        _query['author'] = query.author;
        _query['queryId'] = query._id;
        _query['userId'] = userId;
        _query['status'] = "granted";

        const data = await this.repository.getAll(_query);

        console.log('query access rules that allow you to read are',data.result);

        return data.resultTotalSize > 0;
    }

    create = async(request:Helpers.Request,data) => {

        //author of the query is trying to "grant/revoked" access to a different user
        //different user is trying to "request" access to a query

        data.queryId = request.raw.params['queryId'];

        console.log('access.service',request,data);

        const query = await Services.Binder.boundFunction(BinderNames.QUERY.CHECK.ID_EXISTS)(request,data.queryId);
        
        console.log('access.service','create','query',query);
        
        if(!query)
            throw this.buildError(404,'query not available');

        //data.status = "granted"

        if(data.status === "requested"){
            data.author = query.author;
            data.userId = request.getUserId();
        }else{
            data.author = request.getUserId();
            if(query.author !== data.author)
                throw this.buildError(403,'query author mismatch');
        }

        console.log('access.service','db insert',data);

        data = await this.repository.create(data);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.ACCESS.CREATED,
            data
        });

        console.log('access.service','published message');

        return (await this.embedAuthorInformation(request,[data],['author','userId'],
            Services.Binder.boundFunction(BinderNames.USER.EXTRACT.USER_PROFILES)
        ))[0];
    }

    getAll = async(request:Helpers.Request, query = {}, sort = {}, pageSize:number = 5, pageNum:number = 1, attributes:string[] = []) => {
        const exposableAttributes = ['author','queryId','userId','lastModifiedAt','createdAt','status'];
        if(attributes.length === 0)
            attributes = exposableAttributes;
        else
            attributes = attributes.filter( function( el:string ) {
                return exposableAttributes.includes( el );
            });

        let restriction = {};

        if(request.raw.params['queryId']){
            //WHERE (p.userId = author OR p.userId = userId) AND p.queryId = queryId
            restriction = {
                $and:[
                    {
                        "queryId":request.raw.params['queryId']
                    },
                    {
                        $or:[
                            {"author":request.getUserId()},
                            {"userId":request.getUserId()}
                        ]
                    }
                ]
            }
        }else if(request.isUserAuthenticated()){
            //WHERE p.userId = author OR p.userId = userId
            restriction = {
                $or:[
                    {"author":request.getUserId()},
                    {"userId":request.getUserId()}
                ]
            }
        }else{
            throw this.buildError(404);
        }

        query = {
            $and:[
                query,
                restriction
            ]
        };

        const data = await this.repository.getAll(query,sort,pageSize,pageNum,attributes);

        data.result = await this.embedAuthorInformation(request,data.result,['author','userId'],
        Services.Binder.boundFunction(BinderNames.USER.EXTRACT.USER_PROFILES));

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

        return (await this.embedAuthorInformation(request,[data],['author','userId'],
        Services.Binder.boundFunction(BinderNames.USER.EXTRACT.USER_PROFILES)))[0];
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

        return (await this.embedAuthorInformation(request,[data],['author','userId'],
        Services.Binder.boundFunction(BinderNames.USER.EXTRACT.USER_PROFILES)))[0];
    }

    delete = async(request:Helpers.Request,documentId:string) => {
        let data = await this.repository.delete(documentId)

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.ACCESS.DELETED,
            data
        });

        return (await this.embedAuthorInformation(request,[data],['author','userId'],
        Services.Binder.boundFunction(BinderNames.USER.EXTRACT.USER_PROFILES)))[0];
    }

}

export default AccessService.getInstance();