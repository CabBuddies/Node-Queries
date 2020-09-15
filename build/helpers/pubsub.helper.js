"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubSubMessageTypes = void 0;
const PubSubMessageTypes = {
    QUERY: {
        CREATED: "QUERY_CREATED",
        READ: "QUERY_READ",
        UPDATED: "QUERY_UPDATED",
        DELETED: "QUERY_DELETED"
    },
    RESPONSE: {
        CREATED: "RESPONSE_CREATED",
        READ: "RESPONSE_READ",
        UPDATED: "RESPONSE_UPDATED",
        DELETED: "RESPONSE_DELETED"
    },
    COMMENT: {
        CREATED: "COMMENT_CREATED",
        READ: "COMMENT_READ",
        UPDATED: "COMMENT_UPDATED",
        DELETED: "COMMENT_DELETED"
    },
    OPINION: {
        CREATED: "OPINION_CREATED",
        DELETED: "OPINION_DELETED"
    }
};
exports.PubSubMessageTypes = PubSubMessageTypes;