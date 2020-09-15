"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const repositories_1 = require("../repositories");
const node_library_1 = require("node-library");
const pubsub_helper_1 = require("../helpers/pubsub.helper");
const stats_service_1 = require("./stats.service");
const binder_helper_1 = require("../helpers/binder.helper");
class QueryService extends stats_service_1.default {
    constructor() {
        super(new repositories_1.QueryRepository());
        this.create = (request, bodyP) => __awaiter(this, void 0, void 0, function* () {
            console.log('query.service', request, bodyP);
            // let {
            //     title,
            //     body,
            //     tags,
            //     customAttributes,
            //     status
            // } = bodyP
            // status = status || 'draft';
            // if(['draft','published'].indexOf(status) === -1){
            //     throw this.buildError(400);
            // }
            // let data :any = {
            //     author:request.getUserId(),
            //     customAttributes,
            //     status,
            //     stats:{}
            // }
            // data[status] = {
            //     title,
            //     body,
            //     tags,
            //     lastModifiedAt:Date.now()
            // }
            bodyP = node_library_1.Helpers.JSON.normalizeJson(bodyP);
            bodyP.author = request.getUserId();
            console.log('query.service', 'db insert', bodyP);
            const data = yield this.repository.create(bodyP);
            node_library_1.Services.PubSub.Organizer.publishMessage({
                request,
                type: pubsub_helper_1.PubSubMessageTypes.QUERY.CREATED,
                data
            });
            console.log('query.service', 'published message');
            return data;
        });
        this.update = (request, entityId, bodyP) => __awaiter(this, void 0, void 0, function* () {
            console.log('query.service', request, bodyP);
            let { title, body, tags, customAttributes, status } = bodyP;
            let data = {
                customAttributes
            };
            if (status) {
                if (['draft', 'published'].indexOf(status) === -1) {
                    throw this.buildError(400);
                }
                if (status === 'published') {
                    data.status = 'published';
                    data.draft = {
                        title: '',
                        body: '',
                        tags: [],
                        lastModifiedAt: new Date()
                    };
                }
                data[status] = {
                    title,
                    body,
                    tags,
                    lastModifiedAt: new Date()
                };
            }
            data = node_library_1.Helpers.JSON.normalizeJson(data);
            console.log('query.service', 'db update', data);
            data = yield this.repository.updatePartial(entityId, data);
            node_library_1.Services.PubSub.Organizer.publishMessage({
                request,
                type: pubsub_helper_1.PubSubMessageTypes.QUERY.UPDATED,
                data
            });
            return data;
        });
        this.delete = (request, entityId) => __awaiter(this, void 0, void 0, function* () {
            let data = {
                status: 'deleted'
            };
            data = yield this.repository.updatePartial(entityId, data);
            node_library_1.Services.PubSub.Organizer.publishMessage({
                request,
                type: pubsub_helper_1.PubSubMessageTypes.QUERY.DELETED,
                data
            });
            return data;
        });
        node_library_1.Services.Binder.bindFunction(binder_helper_1.BinderNames.QUERY.CHECK.ID_EXISTS, this.checkIdExists);
    }
    static getInstance() {
        if (!QueryService.instance) {
            QueryService.instance = new QueryService();
        }
        return QueryService.instance;
    }
}
exports.default = QueryService.getInstance();
