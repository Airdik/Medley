//// CONNECTING/SETUP DB ////
const mongoose = require('mongoose');
const config = require('./config.json');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(config.SENDGRID_API_KEY);



mongoose.Promise = global.Promise;
mongoose.connect(`mongodb+srv://${config.DB_USERNAME}:${config.DB_PASSWORD}@medley.7kwux.mongodb.net/${config.DB_DatabaseName}?retryWrites=true&w=majority`, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})
    .then((result) => {
        let date = new Date();
        console.log("Connection to MedleyDB successful");
        console.log(`${ date.getFullYear()}-${ date.getMonth()+1 }-${ date.getDate() }`);
        
        // mongoose.connection.db.listCollections().toArray(function (err, names) {
        //     console.log(names); 
        //     module.exports.Collection = names;
        // });

    })
    .catch((err) => console.log(err));
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', callback => {

});



//// SCHEMAS ////
let userSchema = mongoose.Schema({
    firstName: String, // User's first name
    lastName: String, // User's last name
    username: String, // User's username
    email: String, // User's email
    emailToken: String, // Token used to verify email
    password: String, // User's password
    isVerified: Boolean, // Has the user's email been verified?
    accountCreationDate: Date // User's account creation date
});
let listingSchema = mongoose.Schema({
    belongsTo: String, // User ID this listing belongs to
    listingToken: String, // Token that is used to identify images that belong to this listing
    title: String, // Title of the listing
    description: String, // Description of the problem
    willingToPay: String, // Amount willing to pay the assistor
    locationOfProblem: String, // The location where the problem occurred
    coordinatesOfProblem: String, // The coordinates
});
let chatSchema = mongoose.Schema({
    userOneID: String, // User ones ID(username)
    userTwoID: String, // User two IDs(username)
    chatHistory: Array,
});

//               (Collection name, schema) 
let User = mongoose.model('Users', userSchema);
let Listing = mongoose.model('Listings', listingSchema);
let Chat = mongoose.model('Chats', chatSchema);


exports.AddUser = async (req, res) => {
    console.log(`x${req.body.firstname}`);
    console.log(`xx${req.body.lastname}`);
    console.log(`xxx${req.body.email}`);
    console.log(`xxxx${req.body.username}`);
    console.log(`xxxxx${req.body.password}`);

    // Checking if a user with the username already exists in the database
    let dbUser = await User.findOne({ username: req.body.username });
    let dbUserByEmail = await User.findOne({ email: req.body.email });

    if (dbUser == null && dbUserByEmail == null) {
        console.log('Username is not taken.')

        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(req.body.password, salt);
        let date = new Date();
        let dateNow = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate() }`
        let user = new User({
            firstName: req.body.firstname,
            lastName: req.body.lastname,
            username: req.body.username,
            email: req.body.email,
            emailToken: crypto.randomBytes(64).toString('hex'),
            password: hash,
            isVerified: false,
            accountCreationDate: dateNow
        });

        // Saving user into database
        user.save(async (err, user) => {
            if (err) return console.error(err);
            console.log(user.firstName, "added.")
            
            let msg = {
                from: 'eshrestha961@gmail.com',
                to: user.email,
                subject: "MEDLEY - Verify you email",
                text: `
                    Welcome to the Medley family!

                    Please go to the link below to verify your account.
                    localhost:3000/email-verification?token=${user.emailToken}
                `,
                html: `
                    <h1>Welcome ot the Medley family!</h1>
                    <p>Please go to the link below to verify your account.</p>
                    <a href="http://localhost:3000/email-verification?token=${user.emailToken}">Verify your account</a>
                `
            }
            // Sending the verification email
            try {
                await sgMail.send(msg);
            } catch (err) {
                console.error("SENDING EMAIL ERR:", err);
            }
        })
        res.redirect('/login');

    } else {

        res.render('03_register', {
            title: 'Register',
            css_href: '/03_register.css',
            scriptsList: ["/03_register.js"],
            errors: { username: `${dbUser != null ? "Username Is Taken" : ""}`, email: `${dbUserByEmail != null ? "Email already in use" : ""}` }
        });
    }
}


exports.TryLogin = async (req, res) => {
    let user = await User.findOne({ username: req.body.usernameoremail }); // Finding by username
    let userByEmail = await User.findOne({ email: req.body.usernameoremail }); // Finding by email


    if (user == null && userByEmail == null) {
        res.render('02_login', {
            title: 'Login',
            css_href: '/02_login.css',
            scriptsList: ["/02_login.js"],
            errors: {message: "Incorrect Credentials"}
        });
        console.log("Both username and email are wrong");

    } else {
        let userObject = user != null ? user : userByEmail;
        let validPassword = await bcrypt.compare(req.body.password, userObject.password); // Making sure the hash match
        if (validPassword) {

            // Make sure user is verified
            if (!userObject.isVerified) {
                res.render('_errorPage', {
                    title: 'Error',
                    css_href: '/_errorPage.css',
                    scriptsList: ["/_errorPage.js"],
                    errors: { message: "Please verify your account." }
                });
                return;
                console.log("User was not verified.")
            }
            console.log("XXXXXXXXXXXXXXX");

            // once user and pass are verified then we create a session with any key:value pair we want, which we can check for later
            req.session.user = {
                isAuthenticated: true,
                userID: userObject._id,
                username: userObject.username,
                email: userObject.email,
            }
            console.log(`User: "${userObject.username}" was authenticated.`);
            console.log(`User _ID: ${userObject._id}`);
            //Once logged in redirect to this page
            res.redirect('/');
        } else {
            res.render('02_login', {
                title: 'Login',
                css_href: '/02_login.css',
                scriptsList: ["/02_login.js"],
                errors: { message: "Incorrect Credentials" }
            });
            return;

        }

    }
}

exports.createListingSuccess = async (req, res) => {
    let user = req.session.user;
    let listing = new Listing({
        belongsTo: user.userID,
        listingToken: req.body.listingToken,
        title: req.body.title,
        description: req.body.description,
        willingToPay: req.body.price,
        locationOfProblem: req.body.location
    });

    listing.save(async (err, listing) => {
        if (err) return console.error(err);
        console.log(listing.title, "added")

        
    });
    res.redirect('/viewListings');
}

// API
exports.apiGetListings = async (req, res) => {

    let listing = await Listing.find().lean().exec();
    let fullListingJson = [];

    for (let i = 0; i < listing.length; i++){

        let listingPoster = await User.findById(listing[i].belongsTo); // Listing filter would go here
        let tempJson = {
            "listingPosterID": listingPoster._id,
            "listingPoster": listingPoster.username,
            "listingPosterEmail": listingPoster.email,
            "description": listing[i].description,
            "price": listing[i].willingToPay,
            "location": listing[i].locationOfProblem,
        }
        fullListingJson.push(tempJson);
    }

    res.json(fullListingJson);
}


// _pages
exports.verifyUserEmail = async (req, res) => {
    let token = req.query.token;

    User.findOneAndUpdate({ emailToken: token }, { isVerified: true }).then(() => {
        console.log("User verified")
        res.redirect('/login');
    }).catch((err) => {
        console.log("::UPDATE::", err)
        res.render('_errorPage', {
            title: 'Error',
            css_href: '/_errorPage.css',
            scriptsList: ["/_errorPage.js"],
            errors: { message: "Something went wrong, please try again. (invalid token)" }
        });
    })
    
}