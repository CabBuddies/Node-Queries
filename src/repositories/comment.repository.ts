import {Repositories} from 'node-library';
import {Comment} from '../models';
import AuthorRepository from './author.repository';

class CommentRepository extends AuthorRepository {
    constructor(){
        super(Comment);
    }
}

export default CommentRepository;