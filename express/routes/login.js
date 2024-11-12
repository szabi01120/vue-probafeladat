const express = require('express');
const router = express.Router();
const hash = require('../services/hash');
const db = require('../services/dbConnect');
const crypto = require('crypto');
require('dotenv').config();

let userSessions = {};
let defaultSessionTimeout = 30 * 60 * 1000;

function clearSession(sessionId) {
    delete userSessions[sessionId];
}

function checkIpChange(sessionId, ip) {
    if (userSessions[sessionId].ip !== ip) {
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

function clearExpiredSessions() {
    for (let sessionId in userSessions) {
        if (userSessions[sessionId].timeout < Date.now()) {
            clearSession(sessionId);
        }
    }
}

function userLoggedIn(req, res, next) {
    const sessionId = req.headers['x-session-id'];
    console.log('userSessions from middleware:', userSessions);

    clearExpiredSessions();

    if (sessionId && userSessions[sessionId]) {
        if (!checkIpChange(sessionId, req.ip)) {
            return res.status(401).json({ isLoggedIn: false, error: 'IP cím változás történt!' });
        }
        if (!checkSessionExpiration(sessionId)) {
            return res.status(401).json({ isLoggedIn: false, error: 'Session lejárt, kérjük jelentkezzen be újra.' });
        }

        const remainingTime = userSessions[sessionId].timeout - Date.now();
        res.append('X-Session-Timeout', remainingTime.toString());

        userSessions[sessionId].timeout = Date.now() + (parseInt(process.env.SESSION_TIMEOUT) || defaultSessionTimeout);
        next();
    } else {
        return res.status(401).json({ isLoggedIn: false, error: 'Kérjük jelentkezzen be!' });
    }
}

router.get('/api/check-auth', userLoggedIn, (req, res) => {
    const sessionId = req.headers['x-session-id'];
    return res.json({ isLoggedIn: true, username: userSessions[sessionId].username });
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
            const sessionId = crypto.randomBytes(16).toString('hex');

            userSessions[sessionId] = {
                accountId: rows[0].accountId, 
                ip: req.ip,
                timeout: Date.now() + (parseInt(process.env.SESSION_TIMEOUT) || defaultSessionTimeout),
                username: username,
                sessionId: sessionId
            };

            res.setHeader('X-Session-Id', sessionId);   
            res.json({ isLoggedIn: true, message: 'Sikeres bejelentkezés!' });
        } else {
            res.status(401).json({ isLoggedIn: false, error: 'Hibás felhasználónév vagy jelszó!' });
        }
    });
});

module.exports = { router, userLoggedIn };
