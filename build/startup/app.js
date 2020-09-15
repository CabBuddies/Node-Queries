"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const node_library_1 = require("node-library");
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => { console.log('middleware', 'logger', 'before'); next(); });
app.use(node_library_1.Middlewares.logger('v1'));
app.use((req, res, next) => { console.log('middleware', 'logger', 'after'); next(); });
app.use((req, res, next) => { console.log('middleware', 'requestProcessor', 'before'); next(); });
app.use(node_library_1.Middlewares.requestProcessor(undefined));
app.use((req, res, next) => { console.log('middleware', 'requestProcessor', 'after'); next(); });
exports.default = app;