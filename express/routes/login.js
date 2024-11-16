const express = require('express');
const router = express.Router();
const hash = require('../services/hash');
const emailService = require('../services/emailService');
const db = require('../services/dbConnect');
const sessionService = require('../services/sessionService');
const twoFactorService = require('../services/twoFactorService');
const config = require('../config');

setInterval(sessionService.clearExpiredSessions, config.cleanupInterval);

function userLoggedIn(req, res, next) {
    const sessionId = req.headers['x-session-id'];
    const session = sessionService.getSession(sessionId);

    console.log('sessions: ', sessionService.userSessions);

    if (!session) {
        return res.status(401).json({ isLoggedIn: false, message: 'Kérjük jeletkezz be!' });
    }
    
    if (!sessionService.checkIpChange(sessionId, req.ip)) {
        return res.status(401).json({ isLoggedIn: false, message: 'IP cím változás történt!' });
    }

    if (!sessionService.checkSessionExpiration(sessionId)) {
        return res.status(401).json({ isLoggedIn: false, message: 'Session lejárt, kérjük jelentkezz be újra.' });
    }

    if (session.user2FA && !session.user2FAVerified) {
        return res.status(401).json({ isLoggedIn: false, message: 'Kétlépcsős azonosítás szükséges!' });
    }
    next();
}

router.get('/api/check-auth', userLoggedIn, (req, res) => {
    const sessionId = req.headers['x-session-id'];
    const session = sessionService.getSession(sessionId);

    sessionService.refreshSessionTimeout(sessionId);
    const remainingTime = session.timeout - Date.now();
    res.append('X-Session-Timeout', remainingTime.toString());

    return res.json({ isLoggedIn: true, username: session.username });
});

router.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const hashedPass = hash.hashedPW(username, password);

    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(query, [username, hashedPass], async (err, rows) => {
        if (err) {
            console.error('Hiba a lekérdezés során!', err);
            return res.status(500).json({ message: 'Sikertelen bejelentkezés' });
        }

        if (rows.length > 0) {
            const userEmail = rows[0].email;
            const twoFactorCode = twoFactorService.generate2FACode();

            await emailService.sendTwoFactorEmail(userEmail, twoFactorCode);
            
            const sessionId = sessionService.createSession(username, req.ip);
            twoFactorService.setTwoFactorCode(sessionId, twoFactorCode);
            
            console.log('sessions from login: ', sessionService.getSession(sessionId));
            res.setHeader('X-Session-Id', sessionId);
            res.status(200).json({ isLoggedIn: false, message: 'Kétfaktoros kód elküldve az email címre!' });
        } else {
            res.status(401).json({ isLoggedIn: false, message: 'Hibás felhasználónév vagy jelszó!' });
        }
    });
});

router.post('/api/verify-2fa', (req, res) => {
    const sessionId = req.headers['x-session-id'];
    const twoFactorCode = req.body.twoFactorCode;

    if (twoFactorService.verifyTwoFactorCode(sessionId, twoFactorCode)) {
        res.setHeader('X-Session-Timeout', config.sessionTimeout.toString());
        sessionService.refreshSessionTimeout(sessionId);
        res.status(200).json({ isLoggedIn: true, message: 'Sikeres kétlépcsős azonosítás!' });
    } else {
        res.status(401).json({ isLoggedIn: false, message: 'Hibás 2FA kód!' });
    }
});

router.post('/api/logout', userLoggedIn, (req, res) => {
    const sessionId = req.headers['x-session-id'];
    sessionService.clearSession(sessionId);
    res.json({ isLoggedIn: false, message: 'Sikeres kijelentkezés!' });
});

module.exports = { router, userLoggedIn };
