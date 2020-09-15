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
class AuthorService extends node_library_1.Services.BaseService {
    constructor(repository) {
        super(repository);
        this.isAuthor = (request, entityId) => __awaiter(this, void 0, void 0, function* () {
            return yield this.repository.isAuthor(entityId, request.getUserId());
        });
        this.checkIdExists = (request, id) => __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.repository.get(id);
                console.log('AuthorService', 'checkIdExists', result);
                if (result)
                    return result._id.toString() === id;
            }
            catch (error) {
                console.log(error);
            }
            return false;
        });
    }
}
exports.default = AuthorService;
