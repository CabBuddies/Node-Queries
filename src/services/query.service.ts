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

        let data:any = bodyP;

        data.author = request.getUserId();

        if(data.status === 'published'){
            data.draft = {
                title:'',
                body:'',
                tags:[]
            };
        }

        console.log('query.service','db insert',data);

        data = await this.repository.create(bodyP);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.QUERY.CREATED,
            data
        });

        console.log('query.service','published message');

        return data;
    }

    getAll = async(request:Helpers.Request, query = {}, sort = {}, pageSize:number = 5, pageNum:number = 1, attributes:string[] = []) => {
        const exposableAttributes = ['author','published.title','published.tags','published.lastModifiedAt','createdAt','status','stats','access.type'];
        if(attributes.length === 0)
            attributes = exposableAttributes;
        else
            attributes = attributes.filter( function( el:string ) {
                return exposableAttributes.includes( el );
            });
        return this.repository.getAll(query,sort,pageSize,pageNum,attributes);
    }

    update = async(request:Helpers.Request,documentId:string,bodyP) => {
        console.log('query.service',request,bodyP);

        let data :any = bodyP

        if(data.status === 'published'){
            data.draft = {
                title:'',
                body:'',
                tags:[]
            };
        }else{
            delete data.status
        }

        data[data.status] = {
            lastModifiedAt:new Date()
        }

        //data = Helpers.JSON.normalizeJson(data);

        console.log('query.service','db update',data);

        data = await this.repository.updatePartial(documentId,data);

        Services.PubSub.Organizer.publishMessage({
            request,
            type:PubSubMessageTypes.QUERY.UPDATED,
            data
        });

        return data;
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

        return data;
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