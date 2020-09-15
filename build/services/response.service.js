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
            let { queryId, title, body, customAttributes, status } = bodyP;
            if (!queryId)
                throw this.buildError(400);
            const queryIdExists = yield node_library_1.Services.Binder.boundFunction(binder_helper_1.BinderNames.QUERY.CHECK.ID_EXISTS)(request, queryId);
            console.log('response.service', 'queryIdExists', queryIdExists);
            if (!queryIdExists)
                throw this.buildError(404);
            status = status || 'draft';
            if (['draft', 'published'].indexOf(status) === -1) {
                throw this.buildError(400);
            }
            let data = {
                author: request.getUserId(),
                queryId,
                customAttributes,
                status,
                stats: {}
            };
            data[status] = {
                title,
                body,
                lastModifiedAt: Date.now()
            };
            data = node_library_1.Helpers.JSON.normalizeJson(data);
            console.log('response.service', 'db insert', data);
            data = yield this.repository.create(data);
            node_library_1.Services.PubSub.Organizer.publishMessage({
                request,
                type: pubsub_helper_1.PubSubMessageTypes.RESPONSE.CREATED,
                data
            });
            console.log('response.service', 'published message');
            return data;
        });
        this.update = (request, entityId, bodyP) => __awaiter(this, void 0, void 0, function* () {
            console.log('response.service', request, bodyP);
            let { title, body, customAttributes, status } = bodyP;
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
                    lastModifiedAt: new Date()
                };
            }
            data = node_library_1.Helpers.JSON.normalizeJson(data);
            console.log('response.service', 'db update', data);
            data = yield this.repository.updatePartial(entityId, data);
            node_library_1.Services.PubSub.Organizer.publishMessage({
                request,
                type: pubsub_helper_1.PubSubMessageTypes.RESPONSE.UPDATED,
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
