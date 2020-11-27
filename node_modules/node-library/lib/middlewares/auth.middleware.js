"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function authCheck(required = true, hasToBeConfirmed = false, hasToBeRefresh = false) {
    console.log('AMJ', required, hasToBeRefresh);
    return function (req, res, next) {
        try {
            const request = res.locals.request;
            console.log('AMJ', request);
            if (required) {
                console.log('AMJ', required);
                if (request.hasToken == false) {
                    console.log('AMJ', 401);
                    return res.sendStatus(401);
                }
                if (request.isTokenExpired()) {
                    console.log('AMJ', 403);
                    if (request.getTokenType() === 'refresh')
                        return res.status(403).json({ errorCode: 'REFRESH_TOKEN_EXPIRED', message: 'Refresh Token has expired' });
                    if (request.getTokenType() === 'access')
                        return res.status(403).json({ errorCode: 'ACCESS_TOKEN_EXPIRED', message: 'Access Token has expired' });
                    return res.status(403).json({ errorCode: 'TOKEN_EXPIRED', message: 'Token has expired' });
                }
                if (request.isUserAuthenticated() == false) {
                    console.log('AMJ', 403);
                    return res.status(403).json({ errorCode: 'AUTHENTICATION_REQUIRED', message: 'User is not authenticated' });
                }
                if (hasToBeRefresh)
                    if (request.getToken().type !== 'refresh') {
                        console.log('AMJ', 403);
                        return res.status(403).json({ errorCode: 'REFRESH_TOKEN_REQUIRED', message: 'Refresh token not provided' });
                    }
                if (hasToBeConfirmed === true && request.isUserConfirmed() === false) {
                    console.log('AMJ', 403);
                    return res.status(403).json({ errorCode: 'USER_UNCONFIRMED', message: 'User has not confirmed yet.' });
                }
            }
            console.log('AMJ', 'done');
            next();
        }
        catch (error) {
            console.log(error);
        }
    };
}
exports.default = authCheck;
