import {TagRepository} from '../repositories';
import {Helpers,Services} from 'node-library';
import {PubSubMessageTypes} from '../helpers/pubsub.helper';

class TagService extends Services.BaseService {

    private static instance: TagService;
    
    private constructor() { 
        super(new TagRepository());
        Services.PubSub.Organizer.addSubscriberAll(PubSubMessageTypes.QUERY,this);
    }

    public static getInstance(): TagService {
        if (!TagService.instance) {
            TagService.instance = new TagService();
        }

        return TagService.instance;
    }

    processMessage(message: Services.PubSub.Message) : Promise<Services.PubSub.Message>{
        switch(message.type){
            case PubSubMessageTypes.QUERY.CREATED:
            case PubSubMessageTypes.QUERY.UPDATED:
                
        }
        return new Promise<Services.PubSub.Message>(function(resolve,reject){
            resolve(undefined);
        })
    }

}

export default TagService.getInstance();