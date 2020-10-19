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
class TagService extends node_library_1.Services.BaseService {
    constructor() {
        super(new repositories_1.TagRepository());
        node_library_1.Services.PubSub.Organizer.addSubscriberAll(pubsub_helper_1.PubSubMessageTypes.QUERY, this);
    }
    static getInstance() {
        if (!TagService.instance) {
            TagService.instance = new TagService();
        }
        return TagService.instance;
    }
    processMessage(message) {
        switch (message.type) {
            case pubsub_helper_1.PubSubMessageTypes.QUERY.CREATED:
                this.queryCreated(message.data);
                break;
            case pubsub_helper_1.PubSubMessageTypes.QUERY.UPDATED:
                this.queryUpdated(message.data);
                break;
            case pubsub_helper_1.PubSubMessageTypes.QUERY.UPDATED:
                this.queryDeleted(message.data);
                break;
        }
    }
    queryDeleted(data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.repository.removeQueryFromTags(data._id);
        });
    }
    queryCreated(data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.repository.createTags(data.published.tags);
            yield this.repository.addQueryToTags(data._id, data.published.tags);
        });
    }
    queryUpdated(data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.queryDeleted(data);
            yield this.queryCreated(data);
        });
    }
}
exports.default = TagService.getInstance();
