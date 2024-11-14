const express = require('express');
const router = express.Router();
const hash = require('../services/hash');
const db = require('../services/dbConnect');
const sessionService = require('../services/sessionService');
const config = require('../config');
require('dotenv').config();

setInterval(sessionService.clearExpiredSessions, config.cleanupInterval);

function userLoggedIn(req, res, next) {
    const sessionId = req.headers['x-session-id'];
    console.log('sessions from middleware: ', sessionService.userSessions);

    if (sessionId && sessionService.getSession(sessionId)) {
        const session = sessionService.getSession(sessionId);

        if (!sessionService.checkIpChange(sessionId, req.ip)) {
            return res.status(401).json({ isLoggedIn: false, error: 'IP cím változás történt!' });
        }
        if (!sessionService.checkSessionExpiration(sessionId)) {
            return res.status(401).json({ isLoggedIn: false, error: 'Session lejárt, kérjük jelentkezzen be újra.' });
        }
        sessionService.refreshSessionTimeout(sessionId);

        const remainingTime = session.timeout - Date.now();
        res.append('X-Session-Timeout', remainingTime.toString());
        next();
    } else {
        return res.status(401).json({ isLoggedIn: false, error: 'Kérjük jelentkezzen be!' });
    }
}

router.get('/api/check-auth', userLoggedIn, (req, res) => {
    const sessionId = req.headers['x-session-id'];
    const session = sessionService.getSession(sessionId);
    return res.json({ isLoggedIn: true, username: session.username });
});

router.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const hashedPass = hash.hashedPW(username, password);

    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(query, [username, hashedPass], (err, rows) => {
        if (err) {
            console.error('Hiba a lekérdezés során!', err);
            return res.status(500).json({ error: 'Sikertelen bejelentkezés' });
        }

        if (rows.length > 0) {
            const sessionId = sessionService.createSession(username, req.ip);
            res.setHeader('X-Session-Id', sessionId);   
            res.setHeader('X-Session-Timeout', config.sessionTimeout.toString());
            res.json({ isLoggedIn: true, message: 'Sikeres bejelentkezés!' });
        } else {
            res.status(401).json({ isLoggedIn: false, error: 'Hibás felhasználónév vagy jelszó!' });
        }
    });
});

router.post('/api/logout', userLoggedIn, (req, res) => {
    const sessionId = req.headers['x-session-id'];
    sessionService.clearSession(sessionId);
    res.json({ isLoggedIn: false, message: 'Sikeres kijelentkezés!' });
});

module.exports = { router, userLoggedIn };
