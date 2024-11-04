const express = require('express');
const router = express.Router();
const hash = require('../services/hash');
const db = require('../services/dbConnect');
const crypto = require('crypto');

let userSessions = {};

function userLoggedIn(req, res, next) {
    console.log('userSessions from middleware:', userSessions);
    if (req.session && req.session.loggedin) {
        next();
    } else {
        console.log('Nincs bejelentkezve!');
        res.status(401).json({ error: 'Please log in to access this route.' });
    }
}

router.get('/api/check-auth', (req, res) => {
    console.log('userSessions:', userSessions);
    console.log('SESSION ID FROM AUTH:', req.headers['x-session-id']);
    if (req.headers['x-session-id']) {
        const sessionId = req.headers['x-session-id'];
        console.log('SESSION ID FROM AUTH:', sessionId);
        if (userSessions[sessionId]) {
            if (userSessions[sessionId].timeout > Date.now()) {
                console.log('Session is valid:', userSessions[sessionId]);
                return res.json({ isLoggedIn: true, username: req.session.username });
            } else {
                delete userSessions[sessionId];
                console.log('SESSION TIMEOUT:', req.session);
                return res.json({ isLoggedIn: false });
            }
        }
    } else {
        return res.json({ isLoggedIn: false });
    }
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
                timeout: Date.now() + (10 * 60 * 1000),
                username: username,
                sessionId: sessionId
            };

            res.setHeader('X-Session-Id', sessionId);    
            console.log('SESSION ID login:', sessionId);
            res.json({ isLoggedIn: true, message: 'Sikeres bejelentkezés!' });
        } else {
            res.status(401).json({ isLoggedIn: false, error: 'Hibás felhasználónév vagy jelszó!' });
        }
    });
});

module.exports = { router, userLoggedIn };
