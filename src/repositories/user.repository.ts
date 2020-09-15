import {Repositories} from 'node-library';
import {User} from '../models';

class UserRepository extends Repositories.BaseRepository {
    constructor(){
        super(User);
    }
}

export default UserRepository;