const express = require('express')
const db = require('../services/dbConnect')
const router = express.Router()

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
