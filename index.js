const express = require('express');
const expressSession = require("express-session")({
    secret: "my-secret",
    resave: true,
    saveUninitialized: true
});
const pug = require('pug');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes/routes')
const db = require('./helpers/db');
const cookieParser = require('cookie-parser');
const crypto = require('crypto'); // For generating tokens
const multer = require('multer'); // For reading files uploaded in a form
const fs = require('fs');
const socketio = require('socket.io');
const messageHelper = require('./helpers/messages');

const http = require('http');

const app = express();
const server = http.createServer(app);
const sharedSession = require('express-socket.io-session');
const io = socketio(server);


////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////\
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname + '/public')));
app.use(cookieParser('This is my passphrase'));
app.use(expressSession);
app.use('/ListingImages', express.static('ListingImages')); // Making the listing images upload folder "public so front end can access them"
io.use(sharedSession(expressSession, {
    autoSave: true
}), cookieParser);


//// MIDDLEWAREs ////
const urlencodedParser = bodyParser.urlencoded({
    extended: true
});

const setListingToken = (req, res, next) => {
    try {
        req.app.set('listingToken', crypto.randomBytes(16).toString('hex'));
        next();
    } catch (e) {
        console.log("ERROR::", e);
        res.redirect('/');
    }
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const path = `ListingImages/${req.body.listingToken}`; // Creating a folder with the unique listing token
        fs.mkdirSync(path, { recursive: true })
        cb(null, path)
    },
    filename: (req, file, cb) => {
        cb(null, Date.now()+ path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });




//// ROUTES ////
app.get('/', routes.index);
app.get('/login', routes.login);
app.post('/login', urlencodedParser, routes.verifyLogin);
app.get('/register', routes.register);
app.post('/register', urlencodedParser, routes.registerSuccess);

app.get('/viewListings', routes.viewListings);
app.get('/createListing', routes.createListing);
app.post('/createListing', upload.array('image', 3), routes.createListingSuccess);
app.get('/messages', routes.messages);

// API
app.get('/api-getListings', routes.apiGetListings);
app.get('/api-getListingImages', routes.apiGetListingImages);
app.get('/currentLocation', routes.apiCurrentLocation);
app.get('/api-sendMessage', routes.apiSendMessage);
app.get('/getMapImage', routes.apiGetMapImage);
app.get('/api-ListingViewed', db.apiListingViewed);

// _pages
app.get('/email-verification', routes.verifyUserEmail);




////////////////////////////////////////////////////////////////////////////////////
//                              SOCKET.IO                                         //  
////////////////////////////////////////////////////////////////////////////////////

io.on('connection', (socket) => {
    console.log('New WS Connection...');

    let sessionInfo = socket.handshake.session.user;
    let username = socket.handshake.session.user.username;


    socket.on('fetch-messages', (cb) => {
        
        cb(
            {
            John: {roomcode:000},
            Kate: { roomcode: 001},
            Dan: { roomcode: 002},
            }
        );
    });

    socket.on('listingSendMessage', msg => {

        db.listingSendChat(sessionInfo.userID, msg);
    })

    socket.on("login", (data) => {
        console.log("data",data);
        console.log("USER OBJ::", sessionInfo);
        console.log("USER username:", username);
        socket.handshake.session.save();
    });


    socket.emit('message', messageHelper("BOT", `Welcome ${username}`)); // Single client


    // Broadcast when a user connects, everyone except client
    socket.broadcast.emit('message', messageHelper("Kate", "A user is online"));


    // Listining for chat message
    socket.on('chatMessage', (message) => {
        io.emit('message', messageHelper('USER', message));
        console.log(message);
    })


    // io.emit is for al clients
    // Runs when client disconnects
    socket.on('disconnect', () => {
        io.emit('message', messageHelper("Dan", "A user has left the chat"));
    })



});



server.listen(3000);