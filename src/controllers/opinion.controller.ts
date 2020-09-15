//const BaseController = require('./base.controller')
import * as express from 'express';
import {OpinionService} from '../services';
import {Helpers} from 'node-library';
import {Controllers} from 'node-library';

class OpinionController extends Controllers.BaseController{
    
    constructor(){
        super(OpinionService);
    }

}
export default OpinionController;