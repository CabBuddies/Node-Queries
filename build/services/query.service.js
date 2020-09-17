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
            data = yield this.repository.create(bodyP);
            node_library_1.Services.PubSub.Organizer.publishMessage({
                request,
                type: pubsub_helper_1.PubSubMessageTypes.QUERY.CREATED,
                data
            });
            console.log('query.service', 'published message');
            return data;
        });
        this.getAll = (request, query = {}, sort = {}, pageSize = 5, pageNum = 1, attributes = []) => __awaiter(this, void 0, void 0, function* () {
            const exposableAttributes = ['author', 'published.title', 'published.tags', 'published.lastModifiedAt', 'createdAt', 'status', 'stats', 'access.type'];
            if (attributes.length === 0)
                attributes = exposableAttributes;
            else
                attributes = attributes.filter(function (el) {
                    return exposableAttributes.includes(el);
                });
            return this.repository.getAll(query, sort, pageSize, pageNum, attributes);
        });
        this.update = (request, documentId, bodyP) => __awaiter(this, void 0, void 0, function* () {
            console.log('query.service', request, bodyP);
            let data = bodyP;
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
            data[data.status] = {
                lastModifiedAt: new Date()
            };
            //data = Helpers.JSON.normalizeJson(data);
            console.log('query.service', 'db update', data);
            data = yield this.repository.updatePartial(documentId, data);
            node_library_1.Services.PubSub.Organizer.publishMessage({
                request,
                type: pubsub_helper_1.PubSubMessageTypes.QUERY.UPDATED,
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
                type: pubsub_helper_1.PubSubMessageTypes.QUERY.DELETED,
                data
            });
            return data;
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
    }
    static getInstance() {
        if (!QueryService.instance) {
            QueryService.instance = new QueryService();
        }
        return QueryService.instance;
    }
}
exports.default = QueryService.getInstance();
