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
class AccessController extends node_library_1.Controllers.BaseController {
    constructor(service) {
        super(service);
        this.grantAccess = (req, res) => __awaiter(this, void 0, void 0, function* () {
        });
        this.readAccess = (req, res) => __awaiter(this, void 0, void 0, function* () {
        });
        this.updateAccess = (req, res) => __awaiter(this, void 0, void 0, function* () {
        });
        this.revokeAccess = (req, res) => __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.default = AccessController;
