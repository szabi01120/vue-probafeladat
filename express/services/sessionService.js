const crypto = require('crypto');
const config = require('../config');
const bcrypt = require('bcrypt');

const userSessions = {};
const defaultSessionTimeout = config.sessionTimeout || 10 * 60 * 1000;

function createSession(username, ip, user2FA) {
    const sessionId = crypto.randomBytes(16).toString('hex');
    userSessions[sessionId] = {
        username: username,
        ip: ip,
        timeout: Date.now() + defaultSessionTimeout,
        sessionId: sessionId,
        user2FAVerified: false,
        twoFactorExpires: null,
    };
    return sessionId;
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

function clearSession(sessionId) {
    delete userSessions[sessionId];
}

function checkIpChange(sessionId, ip) {
    if (config.enforceIpCheck && userSessions[sessionId].ip !== ip) {
        clearSession(sessionId);
        return false;
    }
    return true;
}

function checkSessionExpiration(sessionId) {
    if (userSessions[sessionId] && userSessions[sessionId].timeout < Date.now()) {
        clearSession(sessionId);
        return false;
    }
    return true;
}

function refreshSessionTimeout(sessionId) {
    if (userSessions[sessionId]) {
        userSessions[sessionId].timeout = Date.now() + defaultSessionTimeout;
    }
}

function clearExpiredSessions() {
    for (let sessionId in userSessions) {
        if (userSessions[sessionId].timeout < Date.now()) {
            clearSession(sessionId);
        }
    }
}

function getSession(sessionId) {
    return userSessions[sessionId];
}

function isTwoFactorVerified(sessionId) {
    return userSessions[sessionId]?.user2FAVerified || false;
}

module.exports = {
    createSession,
    clearSession,
    checkIpChange,
    checkSessionExpiration,
    refreshSessionTimeout,
    clearExpiredSessions,
    getSession,
    setTwoFactorCode,
    verifyTwoFactorCode,
    isTwoFactorVerified,
    userSessions,
};
