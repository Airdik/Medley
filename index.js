const express = require('express');
const expressSession = require('express-session')
const pug = require('pug');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes/routes')
const cookieParser = require('cookie-parser');


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

const urlencodedParser = bodyParser.urlencoded({
    extended: true
});



app.get('/', routes.index);
app.get('/login', routes.login);
app.post('/login', urlencodedParser, routes.verifyLogin);
app.get('/register', routes.register);
app.post('/register', urlencodedParser, routes.registerSuccess);

app.get('/viewListings', routes.viewListings);
app.get('/createListing', routes.createListing);
app.post('/createListing', urlencodedParser, routes.createListingSuccess)


// API
app.get('/api-getListings', routes.apiGetListings);
// _pages
app.get('/email-verification', routes.verifyUserEmail);



app.listen(3000);