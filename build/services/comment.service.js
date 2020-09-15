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
        this.create = (request, bodyP) => __awaiter(this, void 0, void 0, function* () {
            console.log('comment.service', request, bodyP);
            let { queryId, responseId, body, customAttributes } = bodyP;
            if (queryId) {
                const queryIdExists = yield node_library_1.Services.Binder.boundFunction(binder_helper_1.BinderNames.QUERY.CHECK.ID_EXISTS)(request, queryId);
                console.log('comment.service', 'create', 'queryIdExists', queryIdExists);
                if (!queryIdExists)
                    throw this.buildError(404, 'queryId not available');
                responseId = undefined;
            }
            else if (responseId) {
                const responseIdExists = yield node_library_1.Services.Binder.boundFunction(binder_helper_1.BinderNames.RESPONSE.CHECK.ID_EXISTS)(request, responseId);
                console.log('comment.service', 'create', 'responseIdExists', responseIdExists);
                if (!responseIdExists)
                    throw this.buildError(404, 'responseId not available');
            }
            else {
                throw this.buildError(400, 'queryId or responseId not provided');
            }
            let data = {
                author: request.getUserId(),
                queryId,
                responseId,
                body,
                customAttributes
            };
            data = node_library_1.Helpers.JSON.normalizeJson(data);
            console.log('comment.service', 'db insert', data);
            data = yield this.repository.create(data);
            node_library_1.Services.PubSub.Organizer.publishMessage({
                request,
                type: pubsub_helper_1.PubSubMessageTypes.COMMENT.CREATED,
                data
            });
            console.log('comment.service', 'published message');
            return data;
        });
        this.update = (request, entityId, bodyP) => __awaiter(this, void 0, void 0, function* () {
            console.log('comment.service', request, bodyP);
            let { body, customAttributes } = bodyP;
            let data = {
                body,
                customAttributes
            };
            data = node_library_1.Helpers.JSON.normalizeJson(data);
            console.log('comment.service', 'db update', data);
            data = yield this.repository.updatePartial(entityId, data);
            node_library_1.Services.PubSub.Organizer.publishMessage({
                request,
                type: pubsub_helper_1.PubSubMessageTypes.COMMENT.UPDATED,
                data
            });
            return data;
        });
        this.delete = (request, entityId) => __awaiter(this, void 0, void 0, function* () {
            let data = yield this.repository.delete(entityId);
            node_library_1.Services.PubSub.Organizer.publishMessage({
                request,
                type: pubsub_helper_1.PubSubMessageTypes.COMMENT.DELETED,
                data
            });
            return data;
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
