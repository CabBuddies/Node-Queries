"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const repositories_1 = require("../repositories");
const node_library_1 = require("node-library");
class UserService extends node_library_1.Services.BaseService {
    constructor() {
        super(new repositories_1.UserRepository());
    }
    static getInstance() {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }
}
exports.default = UserService.getInstance();
