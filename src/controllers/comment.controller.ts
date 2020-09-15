//const BaseController = require('./base.controller')
import * as express from 'express';
import {CommentService} from '../services';
import {Helpers} from 'node-library';
import {Controllers} from 'node-library';

class CommentController extends Controllers.BaseController{
    
    constructor(){
        super(CommentService);
    }

}
export default CommentController;