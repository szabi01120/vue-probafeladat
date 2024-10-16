const express = require('express')
const login = require('./routes/login')
const users = require('./routes/users')
const cors = require('cors')

const app = express()
const port = 3000

app.use(cors({
  origin: 'http://127.0.0.1:5173'
}));

app.use(express.json())

app.use(login)
app.use(users)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})