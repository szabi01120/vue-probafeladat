const express = require('express')
const { createHash } = require('crypto')
const db = require('../services/dbConnect')

const app = express()

const query = 'INSERT INTO users (username, password, serial, characterName, email) VALUES (?, ?, ?, ?, ?)';

//register endpoint
app.post('/api/register', (req, res) => {
    const { username, password, serial, characterName, email } = req.body;

    const compinedPw = username + password;

    const hashedPass = createHash('sha256').update(compinedPw).digest('hex');
    
    db.query(query, [username, hashedPass, serial, characterName, email], (err, result) => {
        if (err) {
            console.error('Nem sikerült a regisztráció:', err);
            res.status(500).send('Internal server error');
        } else {
            console.log('Sikeres regisztráció:', result);
            res.status(200).send('Sikeres regisztráció');
        }
    });
});