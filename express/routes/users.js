const express = require('express')
const { createHash } = require('crypto')
const db = require('../services/dbConnect')
const hash = require('./hash')
const router = express.Router()

router.post('/api/users', (req, res) => {
    const { username, password, serial, characterName, email } = req.body;

    const hashedPass = hash.hashedPW(username, password);

    const query = `
        INSERT INTO users (username, password, serial, characterName, email)
        VALUES (?, ?, ?, ?, ?)
    `;
        
    db.query(query, [username, hashedPass, serial, characterName, email], (err, result) => {
        if (err) {
            console.error('Nem sikerült a regisztráció:', err);
            res.status(500).json({ error: 'Nem sikerült a regisztráció!' });
        } else {
            console.log('Sikeres regisztráció:', result);
            res.status(200).json({ message: 'Sikeres regisztráció!' });
        }
    });
});

router.get('/api/users', (req, res) => {
    const query = 'SELECT * FROM users';

    db.query(query, (err, rows, fields) => {
        if (err) {
            console.error('Hiba a lekérdezés során!', err);
            res.status(500).json({ error: 'Hiba a lekérdezés során!' });
            return;
        } else {
            res.status(200).json({ users: rows });
        }
    });
});

module.exports = router;
