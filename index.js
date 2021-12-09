const config = require('./helpers/config.json');
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
const moment = require('moment');

const http = require('http');

const app = express();
const server = http.createServer(app);
const sharedSession = require('express-socket.io-session');
const io = socketio(server);


////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
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
app.get('/userRatings', routes.usersRatings);

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    })
});
// API
//app.get('/api-getListings', routes.apiGetListings);
//app.get('/api-getListingImages', routes.apiGetListingImages);
//app.get('/currentLocation', routes.apiCurrentLocation);
app.get('/api-sendMessage', routes.apiSendMessage);
//app.get('/getMapImage', routes.apiGetMapImage);
//app.get('/api-ListingViewed', db.apiListingViewed);


// _pages
app.get('/email-verification', routes.verifyUserEmail);




////////////////////////////////////////////////////////////////////////////////////
//                              SOCKET.IO                                         //  
////////////////////////////////////////////////////////////////////////////////////

io.on('connection', (socket) => {
    console.log('New WS Connection...');

    let sessionInfo = socket.handshake.session.user;
    let username = socket.handshake.session.user.username;

    // Fetch and return users recent chats
    socket.on('getRecentChats', async (cb) => {
        await db.getRecentChats(sessionInfo.userID, callback => {
            if (callback != false) {
                cb(callback);
            }
        });
    });

    // Fetch and return a chats contents
    socket.on('getChatContents', async (previousChatToken, chatToken, cb) => {
        await db.getChatContents(chatToken, sessionInfo.userID, callback => {
            if (callback != false) {
                cb(callback);
                if (previousChatToken != null || previousChatToken != undefined) {
                    console.log("Leaving room:", previousChatToken);
                    socket.leave(previousChatToken);
                }
                socket.join(chatToken);
                console.log(sessionInfo.username + " joined " + chatToken);
            } else {
                // means no chat was found
            }
        });
    });

    // Sending info used for when client loads messages
    socket.on('getSelfChatInfo', cb => {
        let obj = {
            username: sessionInfo.username,
            userID: sessionInfo.userID
        }
        cb(obj);
    });

    socket.on('rateUser', async(userID, rating, comment, cb) => {
        
        await db.rateUser(sessionInfo.userID, userID, rating, comment, callback => {
            if (callback != false) {
                cb(true);
            } else {
                cb(false);
            }
        });
    });

    // Returns a username from provided userID
    socket.on('getUsernameFromID', async (userID, cb) => {
        console.log("getUsernameFromID called");
        await db.getUsernameFromID(userID, callback => {
            
            if (callback != false) {
                console.log("success");
                cb(callback);
            } else {
                console.log("fail");

                cb(null);
            }
        });
    });

    socket.on('getUsersRatingsByID', async (userID, cb) => {
        await db.getUsersRatingsByID(userID, callback => {
            if (callback != false) {
                cb(callback);
            } else {
                cb(false);
            }
        })
    });

    socket.on("getUsersRatingsStats", async (userID, cb) => {
        await db.getUsersRatingsStats(userID, callback => {
            if (callback != false) {
                cb(callback);
            } else {
                cb(false);
            }
        })
    });

    // When user sends message from the listing page
    socket.on('listingSendMessage', async (msg, cb) => {
        await db.listingSendChat(sessionInfo.userID, msg, callback => {
            console.log("isSuccess::", callback);
            if (callback == true) {

                cb(true);
            } else {
                console.log("ERROR::", "listingSendMessage");
            }
        });
        
    });

    //
    socket.on('sendChat', async (chatToken, message, cb) => {
        if (!chatToken) {
            socket.emit('message', messageHelper("MEDLEY", `My lawyers have asked me not to respond to you.`)); // Single client
            return;
        }
        let time = moment().format('h:mm a');
        await db.sendChat(sessionInfo.userID, chatToken, message, callback => {
            
            if (callback != false) {
                cb({ username: sessionInfo.username, text: message, time: time });
                socket.broadcast.to(chatToken).emit('message', messageHelper(sessionInfo.username, message));
            } else {
                // error
            }
        })

        
    });

    socket.on("login", (data) => {
        console.log("data",data);
        console.log("USER OBJ::", sessionInfo);
        console.log("USER username:", username);
        socket.handshake.session.save();
    });


    socket.emit('message', messageHelper("MEDLEY", `Hello ${username}! It's nice to see you!`)); // Single client


    // Broadcast when a user connects, everyone except client
    //socket.broadcast.emit('message', messageHelper("Kate", "A user is online"));


    // Listining for chat message
    socket.on('chatMessage', (message) => {
        io.emit('message', messageHelper('USER', message));
        console.log(message);
    });



    /////////////////////// API ///////////////////////////
    ///////////////////////////////////////////////////////
    socket.on('api-getListings', async (filterTitle, filterDescription, filterZip, filterPrice,  callback) => {
        await db.apiGetListings(filterTitle, filterDescription, filterZip, filterPrice, cb => {
            callback(cb);
        });
    });

    socket.on('api-getListingImages', (listingToken, callback) => {
        var folder = fs.readdirSync('./ListingImages/' + listingToken);
        var objArray = [];

        var obj = {};
        // var file = fs.readdirSync('./ListingImages/' + req.query.listingToken + '/' + document);
        obj.file = folder;
        objArray.push(obj);

        callback(objArray);

    });

    socket.on("getMapImage", (listingLocation, callback) => {
        let url = `http://www.mapquestapi.com/staticmap/v5/map?key=${config.MAPQUEST_API_KEY}&type=map&size=688,310&locations=${listingLocation}&zoom=15`
        let img = { mapUrl: `${url}` }
        callback(img)

    });

    socket.on("api-ListingViewed", (listingToken) => {
        console.log("Updating views");
        db.apiListingViewed(listingToken);
    });

    socket.on("getCurrentLocation", async (latitude, longitude, callback) => {
        await routes.apiCurrentLocation(latitude, longitude, cb => {
            
            if (callback != false) {
                callback(cb);
            }
        });
    });





    // io.emit is for al clients
    // // Runs when client disconnects
    // socket.on('disconnect', () => {
    //     io.emit('message', messageHelper("Dan", "A user has left the chat"));
    // })



});



server.listen(3000);