"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('module-alias/register');
const express = require("express");
const app_1 = require("./startup/app");
const node_library_1 = require("node-library");
const routes = require("./routes");
startServer();
function startServer() {
    const router = express.Router();
    router.use('/query', routes.QueryRoutes);
    router.use('/response', routes.ResponseRoutes);
    router.use('/comment', routes.CommentRoutes);
    router.use('/tag', routes.TagRoutes);
    router.use('/opinion', routes.OpinionRoutes);
    app_1.default.use('/api/v1', router);
    app_1.default.listen(node_library_1.Config.PORT, () => {
        console.log('app listening', node_library_1.Config.PORT);
    });
    node_library_1.Config.routesList(app_1.default);
}
