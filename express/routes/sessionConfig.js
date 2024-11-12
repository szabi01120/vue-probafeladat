const session = require('express-session');
require('dotenv').config();

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    name: 'sessionId',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    },
    unset: 'destroy'
});

module.exports = sessionMiddleware;