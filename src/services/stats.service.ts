import {Helpers,Services} from 'node-library';
import { StatsRepository } from '../repositories';
import {PubSubMessageTypes} from '../helpers/pubsub.helper';
import AuthorService from './author.service';

class StatsService extends AuthorService {

    constructor(repository : StatsRepository) { 
        super(repository);
    }

    updateStat = async(request:Helpers.Request, entityId, statType, increase:boolean) => {
        this.repository.updateStat(entityId,statType,increase);
    }

}

export default StatsService;