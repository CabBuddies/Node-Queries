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
const models_1 = require("../models");
class TagRepository extends node_library_1.Repositories.BaseRepository {
    constructor() {
        super(models_1.Tag);
        this.createTags = (tags) => __awaiter(this, void 0, void 0, function* () {
            console.log('createTags', tags);
            let docs = yield this.model.find({ tag: { $in: tags } });
            for (const doc of docs) {
                console.log(doc.tag, tags);
                tags = tags.filter(t => doc.tag !== t);
            }
            docs = [];
            for (const tag of tags) {
                docs.push({
                    tag,
                    queries: []
                });
            }
            try {
                yield this.model.insertMany(docs);
            }
            catch (error) {
                console.log(error);
            }
        });
        this.addQueryToTags = (queryId, tags) => __awaiter(this, void 0, void 0, function* () {
            console.log('addQueryToTags', queryId, tags);
            yield this.model.updateMany({ "tag": { $in: tags } }, {
                //@ts-ignore
                $push: {
                    "queries": queryId
                },
                "$inc": {
                    //@ts-ignore
                    "count": 1
                },
                "lastModifiedAt": Date.now()
            });
        });
        this.removeQueryFromTags = (queryId) => __awaiter(this, void 0, void 0, function* () {
            console.log('removeQueryFromTags', queryId);
            yield this.model.updateMany({ "queries": queryId }, {
                //@ts-ignore
                $pull: {
                    "queries": queryId
                },
                "$inc": {
                    //@ts-ignore
                    "count": -1
                },
                "lastModifiedAt": Date.now()
            });
        });
    }
}
exports.default = TagRepository;
