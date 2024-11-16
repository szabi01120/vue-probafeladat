const express = require('express')
const db = require('../services/dbConnect')
const hash = require('../services/hash')
const router = express.Router()

const query = 'INSERT INTO users (username, password, serial, characterName, email) VALUES (?, ?, ?, ?, ?)';

router.post('/api/register', (req, res) => {
    const { username, password, serial, characterName, email } = req.body;
    const hashedPass = hash.hashedPW(username, password);
    
    db.query(query, [username, hashedPass, serial, characterName, email], (err, result) => {
        if (err) {
            console.error('Hiba történt a regisztráció során!', err);
            res.status(500).send('Internal server error');
        } else {
            console.log('Sikeres regisztráció:', result);
            res.status(200).send('Sikeres regisztráció');
        }
    });
});

module.exports = router