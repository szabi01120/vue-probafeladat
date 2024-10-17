const express = require('express');
const session = require('express-session');
const login = require('./routes/login');
const users = require('./routes/users');
const cors = require('cors');

const app = express();
const port = 3000;

function userLoggedIn(req, res, next) {
  const sessionIdHeader = req.headers['x-session-id'];
  if (sessionIdHeader && req.session.id === sessionIdHeader) {
      next();
  } else {
      return res.status(401).json({ error: 'Session not valid or expired' });
  }
}

app.use(cors({
  origin: 'http://127.0.0.1:5173',
  credentials: true
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'secret',  // Same secret as in login.js
    name: 'sessionId',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true if you're using HTTPS
      httpOnly: true,
      maxAge: 60000  // Example: Session expires after 1 minute
    }
}));

app.use(login.router);
app.use(users);

app.get('/api/protected', login.authenticate, (req, res) => {
  res.json({ message: `Hello, ${req.session.username}! This is a protected route.` });
});

app.get('/', (req, res) => {
  if (req.session.loggedin) {
      res.send('Welcome back, ' + req.session.username + '!');
  } else {
      res.send('Please login first.');
  }
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
