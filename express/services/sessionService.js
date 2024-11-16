const crypto = require('crypto');
const config = require('../config');

const userSessions = {};
const defaultSessionTimeout = config.sessionTimeout || 10 * 60 * 1000;

function getSession(sessionId) {
    return userSessions[sessionId];
}

function clearSession(sessionId) {
    delete userSessions[sessionId];
}

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

module.exports = {
    createSession,
    clearSession,
    checkIpChange,
    checkSessionExpiration,
    refreshSessionTimeout,
    clearExpiredSessions,
    getSession,
    userSessions,
};
