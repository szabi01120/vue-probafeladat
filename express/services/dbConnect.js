const mysql = require('mysql2')

const dbConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'mydatabase',
  port: 3030
})

dbConnection.connect()

dbConnection.query('SELECT 1 + 1 AS solution', (err, rows, fields) => {
  if (err) throw err

  console.log('The solution is: ', rows[0].solution)
})

const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    accountId INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    serial VARCHAR(255) NOT NULL,
    characterName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL
);`

dbConnection.query(createUsersTable, (err, result) => {
  if (err) {
    console.error('Nem sikerült létrehozni a táblát:', err);
  }
});

const getUsers = () => {
  const query = 'SELECT * FROM users';

  dbConnection.query(query, (err, rows, fields) => {
    if (err) {
      console.error('Hiba a lekérdezés során!', err);
      return;
    } else {
      console.log('A lekérdezés eredménye:', rows);
    }
  });
};

getUsers();

module.exports = dbConnection
