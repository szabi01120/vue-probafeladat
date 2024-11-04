const express = require('express');
const session = require('express-session');
const cors = require('cors');
const login = require('./routes/login');
const users = require('./routes/users');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;

const sessionMiddleware = session({
  secret: 'secret',
  name: 'sessionId',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 10 * 60 * 1000,
  },
  unset: 'destroy'
});

app.use(sessionMiddleware);
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: 'http://127.0.0.1:5173',
  credentials: true,
  exposedHeaders: ['X-Session-Id']
}));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Expose-Headers', 'X-Session-Id');
  next();
});

app.use(login.router);
app.use(users);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
