import {Repositories} from 'node-library';
import {Query} from '../models';
import StatsRepository from './stats.repository';

class QueryRepository extends StatsRepository {
    constructor(){
        super(Query);
    }
}

export default QueryRepository;