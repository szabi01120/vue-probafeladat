const express = require('express')
const { createHash } = require('crypto')
const router = express.Router()
const hash = require('./hash')
const db = require('../services/dbConnect')

//login endpoint
router.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    const hashedPass = hash.hashedPW(username, password);
    console.log(hashedPass);    

    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';

    db.query(query, [username, hashedPass], (err, rows, fields) => {
        if (err) {
            console.error('Hiba a lekérdezés során!', err);
            const error = res.status(500).json({ error: 'Hiba a lekérdezés során!' });
            return error;
        } 
        
        if (rows.length > 0) {
            res.status(200).json({ message: 'Sikeres bejelentkezés!' });
        } else {
            res.status(401).json({ error: 'Hibás felhasználónév vagy jelszó!' });
        }
        
    });
});

module.exports = router;