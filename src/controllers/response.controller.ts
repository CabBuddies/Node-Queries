//const BaseController = require('./base.controller')
import * as express from 'express';
import {ResponseService} from '../services';
import {Helpers, Controllers} from 'node-library';

class ResponseController extends Controllers.BaseController{
    
    constructor(){
        super(ResponseService);
    }

}
export default new ResponseController();