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
exports.addParamToRequest = exports.requestProcessor = void 0;
const request_helper_1 = require("../helpers/request.helper");
const jwtHelper = require("../helpers/jwt.helper");
const getIP = require('external-ip')();
const geoip = require('geoip-lite');
function extractToken(req) {
    try {
        console.log(req.headers['authorization']);
        const p = req.headers['authorization'].split(' ');
        if (p.length == 2)
            return {
                type: p[0],
                value: p[1],
                expiryTime: 0
            };
    }
    catch (error) {
        console.log(error.message);
    }
    return null;
}
function extractIP(req) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(req.headers);
            const xForwardedFor = ((req.headers['x-forwarded-for'] + '') || '').replace(/:\d+$/, '');
            console.log('xForwardedFor', xForwardedFor, 'req.connection.remoteAddress', req.connection.remoteAddress);
            let ip = xForwardedFor || req.connection.remoteAddress;
            console.log('ip', ip);
            console.log('getIP', getIP);
            ip = yield new Promise((resolve, reject) => {
                getIP((err, _ip) => {
                    console.log('err', err, 'ip', _ip);
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(_ip);
                });
            });
            console.log('ip', 'updated', ip);
            return ip;
        }
        catch (error) {
            console.log(error);
        }
        return null;
    });
}
function requestProcessor(service = null) {
    return function (req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('middleware', 'requestProcessor', 'begin');
            try {
                const request = new request_helper_1.default();
                console.log('middleware', 'requestProcessor', request);
                request.setIP(yield extractIP(req));
                request.setRaw({
                    body: JSON.parse(JSON.stringify(req.body)),
                    query: JSON.parse(JSON.stringify(req.query)),
                    params: JSON.parse(JSON.stringify(req.params))
                });
                const token = extractToken(req);
                request.setToken(token);
                try {
                    const geo = geoip.lookup(request.getIP());
                    request.setLocation({
                        latitude: geo.ll[0],
                        longitude: geo.ll[1],
                        raw: geo
                    });
                }
                catch (error) {
                }
                console.log('middleware', 'requestProcessor', request);
                if (request.hasToken) {
                    const decoded = yield jwtHelper.decodeToken(request.getToken());
                    if (decoded) {
                        let activeTokenCount = 1;
                        try {
                            if (service) {
                                if (request.getTokenType() === 'refresh') {
                                    activeTokenCount = yield service.getActiveRefreshTokenCount(request);
                                }
                            }
                        }
                        catch (error) {
                            console.log('middleware', 'requestProcessor', error);
                            activeTokenCount = 0;
                        }
                        console.log('requestProcessor', 'activeTokenCount', activeTokenCount, decoded);
                        if (activeTokenCount >= 1) {
                            request.setUserId(decoded.id);
                            request.setEmail(decoded.email);
                            token.expiryTime = decoded.expiryTime;
                            request.setToken(token);
                            request.setConfirmed(decoded.isConfirmed);
                        }
                    }
                }
                console.log('middleware', 'requestProcessor', 'almost done', request);
                res.locals = { request };
                next();
            }
            catch (error) {
                console.log('middleware', 'requestProcessor', error);
                res.send(500).send('unknown issue');
            }
        });
    };
}
exports.requestProcessor = requestProcessor;
function addParamToRequest() {
    return (req, res, next, value, name) => {
        const request = res.locals.request;
        request.raw.params[name] = value;
        next();
    };
}
exports.addParamToRequest = addParamToRequest;
