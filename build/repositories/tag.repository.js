"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_library_1 = require("node-library");
const models_1 = require("../models");
class TagRepository extends node_library_1.Repositories.BaseRepository {
    constructor() {
        super(models_1.Tag);
    }
}
exports.default = TagRepository;
