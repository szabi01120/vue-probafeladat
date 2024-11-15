const express = require('express');
const cors = require('cors');
const register = require('./routes/register');
const login = require('./routes/login');
const users = require('./routes/users');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  exposedHeaders: ['X-Session-Id', 'X-Session-Timeout']
}));

app.use(register);

app.use(login.router);
app.use(users);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
