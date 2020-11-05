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
const services_1 = require("../services");
function canAccessQuery(paramName = 'id') {
    return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        const request = res.locals.request;
        console.log('\n\n\nqueryCanRead\n\n\n', request.getRaw(), '\n\n\n');
        //queryId
        //request.getUserId()
        const queryId = request.raw.params[paramName];
        const userId = request.getUserId();
        const allow = yield services_1.AccessService.canUserAccessQuery(request, userId, queryId);
        if (allow) {
            next();
        }
        else {
            res.status(403).send('cannot access the query or its children');
        }
    });
}
exports.default = canAccessQuery;
