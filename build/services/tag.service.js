"use strict";
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
            case pubsub_helper_1.PubSubMessageTypes.QUERY.UPDATED:
        }
        return new Promise(function (resolve, reject) {
            resolve(undefined);
        });
    }
}
exports.default = TagService.getInstance();
