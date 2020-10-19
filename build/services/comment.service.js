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
const author_service_1 = require("./author.service");
const binder_helper_1 = require("../helpers/binder.helper");
class CommentService extends author_service_1.default {
    constructor() {
        super(new repositories_1.CommentRepository());
        this.create = (request, data) => __awaiter(this, void 0, void 0, function* () {
            console.log('comment.service', request, data);
            if (data.queryId) {
                const query = yield node_library_1.Services.Binder.boundFunction(binder_helper_1.BinderNames.QUERY.CHECK.ID_EXISTS)(request, data.queryId);
                console.log('comment.service', 'create', 'query', query);
                if (!query)
                    throw this.buildError(404, 'query not available');
                delete data.responseId;
            }
            else if (data.responseId) {
                const response = yield node_library_1.Services.Binder.boundFunction(binder_helper_1.BinderNames.RESPONSE.CHECK.ID_EXISTS)(request, data.responseId);
                console.log('comment.service', 'create', 'response', response);
                if (!response)
                    throw this.buildError(404, 'response not available');
            }
            else {
                throw this.buildError(400, 'query or response not provided');
            }
            data.author = request.getUserId();
            data = node_library_1.Helpers.JSON.normalizeJson(data);
            console.log('comment.service', 'db insert', data);
            data = yield this.repository.create(data);
            node_library_1.Services.PubSub.Organizer.publishMessage({
                request,
                type: pubsub_helper_1.PubSubMessageTypes.COMMENT.CREATED,
                data
            });
            console.log('comment.service', 'published message');
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
                type: pubsub_helper_1.PubSubMessageTypes.COMMENT.READ,
                data
            });
            return (yield this.embedAuthorInformation(request, [data]))[0];
        });
        this.update = (request, documentId, bodyP) => __awaiter(this, void 0, void 0, function* () {
            console.log('comment.service', request, bodyP);
            let data = bodyP;
            data = node_library_1.Helpers.JSON.normalizeJson(data);
            console.log('comment.service', 'db update', data);
            data = yield this.repository.updatePartial(documentId, data);
            node_library_1.Services.PubSub.Organizer.publishMessage({
                request,
                type: pubsub_helper_1.PubSubMessageTypes.COMMENT.UPDATED,
                data
            });
            return (yield this.embedAuthorInformation(request, [data]))[0];
        });
        this.delete = (request, documentId) => __awaiter(this, void 0, void 0, function* () {
            let data = yield this.repository.delete(documentId);
            node_library_1.Services.PubSub.Organizer.publishMessage({
                request,
                type: pubsub_helper_1.PubSubMessageTypes.COMMENT.DELETED,
                data
            });
            return (yield this.embedAuthorInformation(request, [data]))[0];
        });
    }
    static getInstance() {
        if (!CommentService.instance) {
            CommentService.instance = new CommentService();
        }
        return CommentService.instance;
    }
}
exports.default = CommentService.getInstance();
