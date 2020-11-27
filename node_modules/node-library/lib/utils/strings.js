"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function generateRandomString(data) {
    data.length = data.length || 10;
    let result = '';
    const characters = (data.capitalAlpha ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '') +
        (data.lowerAlpha ? 'abcdefghijklmnopqrstuvwxyz' : '') +
        (data.numbers ? '0123456789' : '');
    const charactersLength = characters.length;
    if (charactersLength === 0)
        return '';
    for (var i = 0; i < data.length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
exports.default = {
    generateRandomString
};
