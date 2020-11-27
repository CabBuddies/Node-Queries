//const BaseController = require('./base.controller')
import * as express from 'express';
import {TagService} from '../services';
import {Helpers} from 'node-library';
import {Controllers} from 'node-library';

class TagController extends Controllers.BaseController{
    
    constructor(){
        super(TagService);
    }

}
export default new TagController();