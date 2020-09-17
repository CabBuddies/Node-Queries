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
class OpinionService extends author_service_1.default {
    constructor() {
        super(new repositories_1.OpinionRepository());
        this.create = (request, data) => __awaiter(this, void 0, void 0, function* () {
            console.log('opinion.service', request, data);
            if (data.queryId) {
                const queryIdExists = yield node_library_1.Services.Binder.boundFunction(binder_helper_1.BinderNames.QUERY.CHECK.ID_EXISTS)(request, data.queryId);
                if (!queryIdExists)
                    throw this.buildError(404, 'queryId not available');
                delete data.responseId;
            }
            else if (data.responseId) {
                const responseIdExists = yield node_library_1.Services.Binder.boundFunction(binder_helper_1.BinderNames.RESPONSE.CHECK.ID_EXISTS)(request, data.responseId);
                if (!responseIdExists)
                    throw this.buildError(404, 'responseId not available');
            }
            else {
                throw this.buildError(400, 'queryId or responseId not provided');
            }
            data.author = request.getUserId();
            let response = yield this.getAll(request, {
                author: data.author,
                queryId: data.queryId,
                responseId: data.responseId,
            }, 100);
            if (response.resultSize > 0) {
                for (const opinion of response.result) {
                    if (data.opinionType === opinion.opinionType) {
                        throw this.buildError(200, opinion);
                    }
                    if ((data.opinionType === 'upvote' && opinion.opinionType === 'downvote')
                        ||
                            (data.opinionType === 'downvote' && opinion.opinionType === 'upvote')) {
                        yield this.delete(request, opinion._id);
                    }
                }
            }
            data = node_library_1.Helpers.JSON.normalizeJson(data);
            console.log('opinion.service', 'db insert', data);
            data = yield this.repository.create(data);
            node_library_1.Services.PubSub.Organizer.publishMessage({
                request,
                type: pubsub_helper_1.PubSubMessageTypes.OPINION.CREATED,
                data
            });
            console.log('opinion.service', 'published message');
            return data;
        });
        this.delete = (request, entityId) => __awaiter(this, void 0, void 0, function* () {
            let data = yield this.repository.delete(entityId);
            node_library_1.Services.PubSub.Organizer.publishMessage({
                request,
                type: pubsub_helper_1.PubSubMessageTypes.OPINION.DELETED,
                data
            });
            return data;
        });
    }
    static getInstance() {
        if (!OpinionService.instance) {
            OpinionService.instance = new OpinionService();
        }
        return OpinionService.instance;
    }
}
exports.default = OpinionService.getInstance();
