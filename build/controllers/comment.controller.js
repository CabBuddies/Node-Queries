"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../services");
const node_library_1 = require("node-library");
class CommentController extends node_library_1.Controllers.BaseController {
    constructor() {
        super(services_1.CommentService);
    }
}
exports.default = CommentController;
