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
const binder_helper_1 = require("../helpers/binder.helper");
const stats_service_1 = require("./stats.service");
class QueryService extends stats_service_1.default {
    constructor() {
        super(new repositories_1.QueryRepository());
        this.create = (request, bodyP) => __awaiter(this, void 0, void 0, function* () {
            console.log('query.service', request, bodyP);
            let data = bodyP;
            data.author = request.getUserId();
            if (data.status === 'published') {
                data.draft = {
                    title: '',
                    body: '',
                    tags: []
                };
            }
            console.log('query.service', 'db insert', data);
            data.stats = {};
            data = yield this.repository.create(data);
            node_library_1.Services.PubSub.Organizer.publishMessage({
                request,
                type: pubsub_helper_1.PubSubMessageTypes.QUERY.CREATED,
                data
            });
            console.log('query.service', 'published message');
            return (yield this.embedAuthorInformation(request, [data]))[0];
        });
        this.getAll = (request, query = {}, sort = {}, pageSize = 5, pageNum = 1, attributes = []) => __awaiter(this, void 0, void 0, function* () {
            const exposableAttributes = ['author', 'published.title', 'published.tags', 'published.lastModifiedAt', 'createdAt', 'status', 'stats', 'access.type'];
            if (attributes.length === 0)
                attributes = exposableAttributes;
            else
                attributes = attributes.filter(function (el) {
                    return exposableAttributes.includes(el);
                });
            const data = yield this.repository.getAll(query, sort, pageSize, pageNum, attributes);
            data.result = yield this.embedAuthorInformation(request, data.result);
            return data;
        });
        this.get = (request, documentId, attributes) => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.repository.get(documentId, attributes);
            if (!data)
                this.buildError(404);
            node_library_1.Services.PubSub.Organizer.publishMessage({
                request,
                type: pubsub_helper_1.PubSubMessageTypes.QUERY.READ,
                data
            });
            return (yield this.embedAuthorInformation(request, [data]))[0];
        });
        this.update = (request, documentId, bodyP) => __awaiter(this, void 0, void 0, function* () {
            console.log('query.service', request, bodyP);
            let data = bodyP;
            data[data.status].lastModifiedAt = new Date();
            if (data.status === 'published') {
                data.draft = {
                    title: '',
                    body: '',
                    tags: []
                };
            }
            else {
                delete data.status;
            }
            //data = Helpers.JSON.normalizeJson(data);
            console.log('query.service', 'db update', data);
            data = yield this.repository.updatePartial(documentId, data);
            node_library_1.Services.PubSub.Organizer.publishMessage({
                request,
                type: pubsub_helper_1.PubSubMessageTypes.QUERY.UPDATED,
                data
            });
            return (yield this.embedAuthorInformation(request, [data]))[0];
        });
        this.delete = (request, documentId) => __awaiter(this, void 0, void 0, function* () {
            let data = {
                status: 'deleted'
            };
            data = yield this.repository.updatePartial(documentId, data);
            node_library_1.Services.PubSub.Organizer.publishMessage({
                request,
                type: pubsub_helper_1.PubSubMessageTypes.QUERY.DELETED,
                data
            });
            return (yield this.embedAuthorInformation(request, [data]))[0];
        });
        this.deepEqual = (x, y) => {
            if (x === y) {
                return true;
            }
            else if ((typeof x == "object" && x != null) && (typeof y == "object" && y != null)) {
                if (Object.keys(x).length != Object.keys(y).length)
                    return false;
                for (var prop in x) {
                    if (y.hasOwnProperty(prop)) {
                        if (!this.deepEqual(x[prop], y[prop]))
                            return false;
                    }
                    else
                        return false;
                }
                return true;
            }
            else
                return false;
        };
        node_library_1.Services.Binder.bindFunction(binder_helper_1.BinderNames.QUERY.CHECK.ID_EXISTS, this.checkIdExists);
        node_library_1.Services.PubSub.Organizer.addSubscriber(pubsub_helper_1.PubSubMessageTypes.QUERY.READ, this);
        node_library_1.Services.PubSub.Organizer.addSubscriberAll(pubsub_helper_1.PubSubMessageTypes.OPINION, this);
        node_library_1.Services.PubSub.Organizer.addSubscriber(pubsub_helper_1.PubSubMessageTypes.RESPONSE.CREATED, this);
        node_library_1.Services.PubSub.Organizer.addSubscriber(pubsub_helper_1.PubSubMessageTypes.RESPONSE.DELETED, this);
        node_library_1.Services.PubSub.Organizer.addSubscriber(pubsub_helper_1.PubSubMessageTypes.COMMENT.CREATED, this);
        node_library_1.Services.PubSub.Organizer.addSubscriber(pubsub_helper_1.PubSubMessageTypes.COMMENT.DELETED, this);
    }
    static getInstance() {
        if (!QueryService.instance) {
            QueryService.instance = new QueryService();
        }
        return QueryService.instance;
    }
    processMessage(message) {
        switch (message.type) {
            case pubsub_helper_1.PubSubMessageTypes.QUERY.READ:
                this.queryRead(message.request, message.data);
                break;
            case pubsub_helper_1.PubSubMessageTypes.OPINION.CREATED:
                this.opinionCreated(message.request, message.data, 'queryId');
                break;
            case pubsub_helper_1.PubSubMessageTypes.OPINION.DELETED:
                this.opinionDeleted(message.request, message.data, 'queryId');
                break;
            case pubsub_helper_1.PubSubMessageTypes.RESPONSE.CREATED:
                this.responseCreated(message.request, message.data);
                break;
            case pubsub_helper_1.PubSubMessageTypes.RESPONSE.DELETED:
                this.responseDeleted(message.request, message.data);
                break;
            case pubsub_helper_1.PubSubMessageTypes.COMMENT.CREATED:
                this.commentCreated(message.request, message.data, 'queryId');
                break;
            case pubsub_helper_1.PubSubMessageTypes.COMMENT.DELETED:
                this.commentDeleted(message.request, message.data, 'queryId');
                break;
        }
    }
    responseCreated(request, data) {
        this.updateStat(request, data.queryId, "responseCount", true);
    }
    responseDeleted(request, data) {
        this.updateStat(request, data.queryId, "responseCount", false);
    }
    queryRead(request, data) {
        this.updateStat(request, data._id, "viewCount", true);
    }
}
exports.default = QueryService.getInstance();
