let express = require('express');
let session = require('express-session')
let UserModel = require('./models').UserModel;


let app = express();
let http = require('http').createServer(app);
let io = require('socket.io')(http);
let port = 3000
// Parse data from http requests
app.use(express.json());
// Public assets
app.use(express.static('public'));

// Mongo Database  Connection
let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/hamsa', { useNewUrlParser: true, useUnifiedTopology: true });
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Connected to MongoDB successfully');
});

// Express session middleware
let sessionMiddleware = session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true }
})
// Express session
app.use(sessionMiddleware)
// Session Middleware & Socket-io
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
  // sessionMiddleware(socket.request, socket.request.res, next); will not work with websocket-only
  // connections, as 'socket.request.res' will be undefined in that case
});




app.use(require('./signUp'));
app.use(require('./signIn'));
app.use(require('./checkAuth'));
app.use(require('./activate'));
app.use(require('./createRoom'));
app.use(require('./joinRoom'));


io.on('connection', async (socket) => {
  console.log('user connected', socket.id);
  if (socket.request.session.userId) {
    console.log("user is signed in: ", socket.request.session.userId)
    let user = await UserModel.findById(socket.request.session.userId).populate({
      path: 'rooms', populate: { path: 'chat', model: 'Message' }
    });
    if (user) socket.emit('signedIn', user);
  }
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('createRoom', data => {

  })
});


http.listen(port, () => {
  console.log('listening on *:3000');
});
