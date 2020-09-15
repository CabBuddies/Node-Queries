"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
const node_library_1 = require("node-library");
const Access = db_1.primaryDb.model('Access', node_library_1.Schemas.simpleAccessSchema);
exports.default = Access;
