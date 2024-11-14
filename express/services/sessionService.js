const crypto = require('crypto');
const config = require('../config');

const userSessions = {};

function createSession(username, ip) {
    const sessionId = crypto.randomBytes(16).toString('hex');
    userSessions[sessionId] = {
        username: username,
        ip: ip,
        timeout: Date.now() + config.sessionTimeout,
        sessionId: sessionId,
    };
    return sessionId;
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
        userSessions[sessionId].timeout = Date.now() + config.sessionTimeout;
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

module.exports = {
    createSession,
    clearSession,
    checkIpChange,
    checkSessionExpiration,
    refreshSessionTimeout,
    clearExpiredSessions,
    getSession,
    userSessions
};
