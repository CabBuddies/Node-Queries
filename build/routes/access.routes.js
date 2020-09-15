"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const node_library_1 = require("node-library");
const middlewares_1 = require("../middlewares");
function buildAccessRoutes(controller) {
    const router = express_1.Router();
    router.use(node_library_1.Middlewares.authCheck(true));
    router.use(middlewares_1.accessCheck('U', controller.service));
    if (controller.create)
        router.post('/', controller.create);
    if (controller.getAll)
        router.get('/', controller.getAll);
    if (controller.get)
        router.get('/:aid', controller.get);
    if (controller.update)
        router.put('/:aid', controller.update);
    if (controller.delete)
        router.delete('/:aid', controller.delete);
    return router;
}
exports.default = buildAccessRoutes;
;
