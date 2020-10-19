"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../services");
const node_library_1 = require("node-library");
class AccessController extends node_library_1.Controllers.BaseController {
    constructor() {
        super(services_1.AccessService);
    }
}
exports.default = AccessController;
