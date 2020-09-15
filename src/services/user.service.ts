import {UserRepository} from '../repositories';
import {Helpers,Services} from 'node-library';
import {PubSubMessageTypes} from '../helpers/pubsub.helper';

class UserService extends Services.BaseService {

    private static instance: UserService;
    
    private constructor() { 
        super(new UserRepository());
    }

    public static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }

        return UserService.instance;
    }

}

export default UserService.getInstance();