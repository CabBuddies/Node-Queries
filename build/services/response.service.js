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
        this.create = (request, data) => __awaiter(this, void 0, void 0, function* () {
            console.log('response.service', request, data);
            data.queryId = request.raw.params['queryId'];
            data.author = request.getUserId();
            if (data.status === 'published') {
                data.draft = {
                    title: '',
                    body: ''
                };
            }
            console.log('query.service', 'db insert', data);
            data.stats = {};
            data = yield this.repository.create(data);
            node_library_1.Services.PubSub.Organizer.publishMessage({
                request,
                type: pubsub_helper_1.PubSubMessageTypes.RESPONSE.CREATED,
                data
            });
            console.log('query.service', 'published message');
            return (yield this.embedAuthorInformation(request, [data]))[0];
        });
        this.getAll = (request, query = {}, sort = {}, pageSize = 5, pageNum = 1, attributes = []) => __awaiter(this, void 0, void 0, function* () {
            const exposableAttributes = ['author', 'queryId', 'published.title', 'published.tags', 'published.lastModifiedAt', 'createdAt', 'status', 'stats', 'access.type'];
            if (attributes.length === 0)
                attributes = exposableAttributes;
            else
                attributes = attributes.filter(function (el) {
                    return exposableAttributes.includes(el);
                });
            const queryId = request.raw.params['queryId'];
            query = {
                "$and": [
                    {
                        "queryId": queryId
                    },
                    query
                ]
            };
            const data = yield this.repository.getAll(query, sort, pageSize, pageNum, attributes);
            data.result = yield this.embedAuthorInformation(request, data.result);
            return data;
        });
        this.get = (request, documentId, attributes) => __awaiter(this, void 0, void 0, function* () {
            const query = {
                queryId: request.raw.params['queryId'],
                _id: documentId
            };
            const data = yield this.repository.getOne(query, attributes);
            if (!data)
                this.buildError(404);
            node_library_1.Services.PubSub.Organizer.publishMessage({
                request,
                type: pubsub_helper_1.PubSubMessageTypes.RESPONSE.READ,
                data
            });
            return (yield this.embedAuthorInformation(request, [data]))[0];
        });
        this.update = (request, documentId, data) => __awaiter(this, void 0, void 0, function* () {
            console.log('response.service', request, data);
            const query = {
                queryId: request.raw.params['queryId'],
                _id: documentId
            };
            data[data.status].lastModifiedAt = new Date();
            if (data.status === 'published') {
                data.draft = {
                    title: '',
                    body: ''
                };
            }
            else {
                delete data.status;
            }
            //data = Helpers.JSON.normalizeJson(data);
            console.log('response.service', 'db update', data);
            data = yield this.repository.updateOnePartial(query, data);
            node_library_1.Services.PubSub.Organizer.publishMessage({
                request,
                type: pubsub_helper_1.PubSubMessageTypes.RESPONSE.UPDATED,
                data
            });
            return (yield this.embedAuthorInformation(request, [data]))[0];
        });
        this.delete = (request, documentId) => __awaiter(this, void 0, void 0, function* () {
            let data = {
                status: 'deleted'
            };
            const query = {
                queryId: request.raw.params['queryId'],
                _id: documentId
            };
            data = yield this.repository.updateOnePartial(query, data);
            node_library_1.Services.PubSub.Organizer.publishMessage({
                request,
                type: pubsub_helper_1.PubSubMessageTypes.RESPONSE.DELETED,
                data
            });
            return (yield this.embedAuthorInformation(request, [data]))[0];
        });
        node_library_1.Services.Binder.bindFunction(binder_helper_1.BinderNames.RESPONSE.CHECK.ID_EXISTS, this.checkIdExists);
        node_library_1.Services.PubSub.Organizer.addSubscriberAll(pubsub_helper_1.PubSubMessageTypes.OPINION, this);
        node_library_1.Services.PubSub.Organizer.addSubscriber(pubsub_helper_1.PubSubMessageTypes.COMMENT.CREATED, this);
        node_library_1.Services.PubSub.Organizer.addSubscriber(pubsub_helper_1.PubSubMessageTypes.COMMENT.DELETED, this);
    }
    static getInstance() {
        if (!ResponseService.instance) {
            ResponseService.instance = new ResponseService();
        }
        return ResponseService.instance;
    }
    processMessage(message) {
        switch (message.type) {
            case pubsub_helper_1.PubSubMessageTypes.OPINION.CREATED:
                this.opinionCreated(message.request, message.data, 'responseId');
                break;
            case pubsub_helper_1.PubSubMessageTypes.OPINION.DELETED:
                this.opinionDeleted(message.request, message.data, 'responseId');
                break;
            case pubsub_helper_1.PubSubMessageTypes.COMMENT.CREATED:
                this.commentCreated(message.request, message.data, 'responseId');
                break;
            case pubsub_helper_1.PubSubMessageTypes.COMMENT.DELETED:
                this.commentDeleted(message.request, message.data, 'responseId');
                break;
        }
    }
}
exports.default = ResponseService.getInstance();
