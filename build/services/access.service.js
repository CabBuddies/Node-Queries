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
const node_library_1 = require("node-library");
const repositories_1 = require("../repositories");
const pubsub_helper_1 = require("../helpers/pubsub.helper");
const author_service_1 = require("./author.service");
const binder_helper_1 = require("../helpers/binder.helper");
class AccessService extends author_service_1.default {
    constructor() {
        super(new repositories_1.AccessRepository());
        this.create = (request, data) => __awaiter(this, void 0, void 0, function* () {
            console.log('access.service', request, data);
            const query = yield node_library_1.Services.Binder.boundFunction(binder_helper_1.BinderNames.QUERY.CHECK.ID_EXISTS)(request, data.queryId);
            console.log('access.service', 'create', 'query', query);
            if (!query)
                throw this.buildError(404, 'query not available');
            data.author = request.getUserId();
            if (query.author !== data.author)
                throw this.buildError(403, 'query author mismatch');
            console.log('access.service', 'db insert', data);
            data = yield this.repository.create(data);
            node_library_1.Services.PubSub.Organizer.publishMessage({
                request,
                type: pubsub_helper_1.PubSubMessageTypes.ACCESS.CREATED,
                data
            });
            console.log('access.service', 'published message');
            return (yield this.embedAuthorInformation(request, [data], ['author', 'userId']))[0];
        });
        this.getAll = (request, query = {}, sort = {}, pageSize = 5, pageNum = 1, attributes = []) => __awaiter(this, void 0, void 0, function* () {
            const exposableAttributes = ['author', 'queryId', 'userId', 'lastModifiedAt', 'createdAt', 'status'];
            if (attributes.length === 0)
                attributes = exposableAttributes;
            else
                attributes = attributes.filter(function (el) {
                    return exposableAttributes.includes(el);
                });
            query['author'] = request.getUserId();
            const data = yield this.repository.getAll(query, sort, pageSize, pageNum, attributes);
            data.result = yield this.embedAuthorInformation(request, data.result, ['author', 'userId']);
            return data;
        });
        this.get = (request, documentId, attributes) => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.repository.getAccessDocument(documentId, request.getUserId());
            if (!data)
                this.buildError(404);
            node_library_1.Services.PubSub.Organizer.publishMessage({
                request,
                type: pubsub_helper_1.PubSubMessageTypes.ACCESS.READ,
                data
            });
            return (yield this.embedAuthorInformation(request, [data], ['author', 'userId']))[0];
        });
        this.update = (request, documentId, data) => __awaiter(this, void 0, void 0, function* () {
            console.log('access.service', request, data);
            data = node_library_1.Helpers.JSON.normalizeJson(data);
            console.log('access.service', 'db update', data);
            data = yield this.repository.updatePartial(documentId, data);
            node_library_1.Services.PubSub.Organizer.publishMessage({
                request,
                type: pubsub_helper_1.PubSubMessageTypes.ACCESS.UPDATED,
                data
            });
            return (yield this.embedAuthorInformation(request, [data], ['author', 'userId']))[0];
        });
        this.delete = (request, documentId) => __awaiter(this, void 0, void 0, function* () {
            let data = yield this.repository.delete(documentId);
            node_library_1.Services.PubSub.Organizer.publishMessage({
                request,
                type: pubsub_helper_1.PubSubMessageTypes.ACCESS.DELETED,
                data
            });
            return (yield this.embedAuthorInformation(request, [data], ['author', 'userId']))[0];
        });
    }
    static getInstance() {
        if (!AccessService.instance) {
            AccessService.instance = new AccessService();
        }
        return AccessService.instance;
    }
}
exports.default = AccessService.getInstance();
