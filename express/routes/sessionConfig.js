const session = require('express-session');
require('dotenv').config();

const defaultSessionTimeout = 30 * 60 * 1000;

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    name: 'sessionId',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: parseInt(process.env.SESSION_TIMEOUT) || defaultSessionTimeout,
    },
    unset: 'destroy'
});

module.exports = sessionMiddleware;