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
class ResponseService extends stats_service_1.default {
    constructor() {
        super(new repositories_1.ResponseRepository());
        this.create = (request, bodyP) => __awaiter(this, void 0, void 0, function* () {
            console.log('response.service', request, bodyP);
            const queryIdExists = yield node_library_1.Services.Binder.boundFunction(binder_helper_1.BinderNames.QUERY.CHECK.ID_EXISTS)(request, bodyP.queryId);
            console.log('response.service', 'responseIdExists', queryIdExists);
            if (!queryIdExists)
                throw this.buildError(404);
            let data = bodyP;
            data.author = request.getUserId();
            if (data.status === 'published') {
                data.draft = {
                    title: '',
                    body: ''
                };
            }
            console.log('query.service', 'db insert', data);
            data = yield this.repository.create(data);
            node_library_1.Services.PubSub.Organizer.publishMessage({
                request,
                type: pubsub_helper_1.PubSubMessageTypes.RESPONSE.CREATED,
                data
            });
            console.log('query.service', 'published message');
            return data;
        });
        this.getAll = (request, query = {}, sort = {}, pageSize = 5, pageNum = 1, attributes = []) => __awaiter(this, void 0, void 0, function* () {
            const exposableAttributes = ['author', 'queryId', 'published.title', 'published.tags', 'published.lastModifiedAt', 'createdAt', 'status', 'stats', 'access.type'];
            if (attributes.length === 0)
                attributes = exposableAttributes;
            else
                attributes = attributes.filter(function (el) {
                    return exposableAttributes.includes(el);
                });
            return this.repository.getAll(query, sort, pageSize, pageNum, attributes);
        });
        this.update = (request, documentId, bodyP) => __awaiter(this, void 0, void 0, function* () {
            console.log('response.service', request, bodyP);
            let data = bodyP;
            if (data.status === 'published') {
                data.draft = {
                    title: '',
                    body: ''
                };
            }
            else {
                delete data.status;
            }
            data[data.status] = {
                lastModifiedAt: new Date()
            };
            //data = Helpers.JSON.normalizeJson(data);
            console.log('response.service', 'db update', data);
            data = yield this.repository.updatePartial(documentId, data);
            node_library_1.Services.PubSub.Organizer.publishMessage({
                request,
                type: pubsub_helper_1.PubSubMessageTypes.RESPONSE.UPDATED,
                data
            });
            return data;
        });
        this.delete = (request, documentId) => __awaiter(this, void 0, void 0, function* () {
            let data = {
                status: 'deleted'
            };
            data = yield this.repository.updatePartial(documentId, data);
            node_library_1.Services.PubSub.Organizer.publishMessage({
                request,
                type: pubsub_helper_1.PubSubMessageTypes.RESPONSE.DELETED,
                data
            });
            return data;
        });
        node_library_1.Services.Binder.bindFunction(binder_helper_1.BinderNames.RESPONSE.CHECK.ID_EXISTS, this.checkIdExists);
    }
    static getInstance() {
        if (!ResponseService.instance) {
            ResponseService.instance = new ResponseService();
        }
        return ResponseService.instance;
    }
}
exports.default = ResponseService.getInstance();
