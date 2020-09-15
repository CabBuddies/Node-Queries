"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function accessCheck(model = 'Query', type = 'R') {
    console.log('AMJ', type);
    return function (req, res, next) {
        try {
            const request = res.locals.request;
            console.log('AMJ', request);
            next();
        }
        catch (error) {
            console.log(error);
        }
    };
}
exports.default = accessCheck;
