const bcrypt = require('bcrypt');
const config = require('../config');
const crypto = require('crypto');
const sessionService = require('./sessionService');

const userSessions = sessionService.userSessions;

function generate2FACode() {
    return crypto.randomInt(100000, 999999).toString();
}

function setTwoFactorCode(sessionId, twoFactorCode) {
    if (userSessions[sessionId]) {
        const hashed2FA = bcrypt.hashSync(twoFactorCode, 10);
        userSessions[sessionId].user2FA = hashed2FA;
        userSessions[sessionId].twoFactorExpires = Date.now() + config.twoFactorTimeout;
    }
    else {
        throw new Error('Nincs munkamenet!');
    }
}

function verifyTwoFactorCode(sessionId, code) {
    const session = userSessions[sessionId];
    if (!session) return false;

    const isExpired = session.twoFactorExpires && session.twoFactorExpires < Date.now();
    const isValidCode = session.user2FA && bcrypt.compareSync(code, session.user2FA);

    if (isExpired) {
        clearSession(sessionId);
        return false;
    }

    if (isValidCode) {
        session.user2FAVerified = true;
        return true;
    }
    return false;
}

function isTwoFactorVerified(sessionId) {
    return userSessions[sessionId]?.user2FAVerified || false;
}

module.exports = {
    generate2FACode,
    setTwoFactorCode,
    verifyTwoFactorCode,
    isTwoFactorVerified,
};