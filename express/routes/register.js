const express = require('express')
const { createHash } = require('crypto')
const db = require('../services/dbConnect')
const hash = require('../services/hash')

const app = express()

const query = 'INSERT INTO users (username, password, serial, characterName, email) VALUES (?, ?, ?, ?, ?)';

//register endpoint
app.post('/api/register', (req, res) => {
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