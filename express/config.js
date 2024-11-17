require('dotenv').config();

module.exports = {
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT) || 30 * 60 * 1000,
    twoFactorTimeout: parseInt(process.env.TWO_FACTOR_TIMEOUT) || 5 * 60 * 1000,
    cleanupInterval: 60000,
    enforceIpCheck: true,
};
