//const BaseController = require('./base.controller')
import * as express from 'express';
import {QueryService} from '../services';
import {Helpers, Controllers} from 'node-library';

class QueryController extends Controllers.BaseController{
    
    constructor(){
        super(QueryService);
    }

}
export default new QueryController();