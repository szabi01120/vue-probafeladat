const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')

const router = express.Router()
const hash = require('../services/hash')
const db = require('../services/dbConnect')

router.use(session({
    secret: 'secret',
    name: 'sessionId',
    resave: true,
    saveUninitialized: false
}));

function authenticate(req, res, next) {
    if (req.session.loggedin) {
        next();
    } else {
        res.status(401).json({ error: 'Please log in to access this route.' });
    }
}

//login endpoint
router.post('/api/login',
    bodyParser.urlencoded(),
    (req, res, next) => {
        const { username, password } = req.body;

        const hashedPass = hash.hashedPW(username, password);
        console.log(hashedPass);

        const query = 'SELECT * FROM users WHERE username = ? AND password = ?';

        db.query(query, [username, hashedPass], (err, rows, fields) => {
            if (err) {
                console.error('Hiba a lekérdezés során!', err);
                const error = res.status(500).json({ error: 'Sikertelen bejelentkezés' });
                return error;
            }

            if (rows.length > 0) {
                res.status(200).json({ 
                    message: 'Sikeres bejelentkezés!', 
                    session_id: req.session.id,
                    loggedin: true,
                });
                res.locals.username = username;
                next();
            } else {
                res.status(401).json({ error: 'Hibás felhasználónév vagy jelszó!' });
            }
        });

    }
    , (req, res) => {
        req.session.loggedin = true;
        req.session.username = res.locals.username;
        console.log('Session:', req.session);
        res.end();
    }
);

module.exports = { router, authenticate };