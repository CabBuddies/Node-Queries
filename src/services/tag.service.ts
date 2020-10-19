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

    processMessage(message: Services.PubSub.Message){
        switch(message.type){
            case PubSubMessageTypes.QUERY.CREATED:
                this.queryCreated(message.data);
                break;
            case PubSubMessageTypes.QUERY.UPDATED:
                this.queryUpdated(message.data);
                break;
            case PubSubMessageTypes.QUERY.UPDATED:
                this.queryDeleted(message.data);
                break;
        }
    }

    async queryDeleted(data: any) {
        await this.repository.removeQueryFromTags(data._id);
    }

    async queryCreated(data: any) {
        await this.repository.createTags(data.published.tags);
        await this.repository.addQueryToTags(data._id,data.published.tags);
    }
    
    async queryUpdated(data: any) {
        await this.queryDeleted(data);
        await this.queryCreated(data);
    }


}

export default TagService.getInstance();