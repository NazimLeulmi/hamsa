const express = require('express');
const db = require('./database');
const session = require('express-session')


const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = 3000

// express session
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true }
}))
// Parse data from http requests
app.use(express.json());
// Public assets
app.use(express.static('public'));


db.connect(function (err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
  }
  console.log('MySQL db: ' + db.threadId);
});


io.on('db', (socket) => {
  console.log('a user connected');
});

http.listen(port, () => {
  console.log('listening on *:3000');
});
