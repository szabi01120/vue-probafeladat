require('dotenv').config();

module.exports = {
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT) || 10 * 60 * 1000,
    cleanupInterval: 60000,
    enforceIpCheck: true
};
