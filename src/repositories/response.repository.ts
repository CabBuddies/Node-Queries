import {Repositories} from 'node-library';
import {Response} from '../models';
import StatsRepository from './stats.repository';

class ResponseRepository extends StatsRepository {
    constructor(){
        super(Response);
    }
}

export default ResponseRepository;