"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_library_1 = require("node-library");
const models_1 = require("../models");
class UserRepository extends node_library_1.Repositories.BaseRepository {
    constructor() {
        super(models_1.User);
    }
}
exports.default = UserRepository;
