const express = require('express');
const expressSession = require('express-session')
const pug = require('pug');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes/routes')
const cookieParser = require('cookie-parser');
const crypto = require('crypto'); // For generating tokens
const multer = require('multer'); // For reading files uploaded in a form
const fs = require('fs');

const app = express();
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
})

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname + '/public')));
app.use(cookieParser('This is my passphrase'));
app.use(expressSession({
    secret: 'MySession',
    saveUninitialized: true,
    resave: true
}));
app.use('/ListingImages', express.static('ListingImages')); // Making the listing images upload folder "public so front end can access them"

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
app.post('/createListing', upload.array('image', 3), routes.createListingSuccess)


// API
app.get('/api-getListings', routes.apiGetListings);
app.get('/api-getListingImages', routes.apiGetListingImages);
app.get('/currentLocation', routes.apiCurrentLocation);
app.get('/api-sendMessage', routes.apiSendMessage);
app.get('/getMapImage', routes.apiGetMapImage);

// _pages
app.get('/email-verification', routes.verifyUserEmail);



app.listen(3000);