//// CONNECTING/SETUP DB ////
const mongoose = require('mongoose');
const config = require('./config.json');
const bcrypt = require('bcryptjs');

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
    password: String, // User's password
    isVerified: Boolean, // Has the user's email been verified?
    accountCreationDate: Date // User's account creation date
});
let listingSchema = mongoose.Schema({
    belongsTo: String, // User ID this listing belongs to
    description: String, // Description of the problem
    willingToPay: String, // Amount willing to pay the assistor
    locationOfProblem: String, // The location where the problem occurred
});
let chatSchema = mongoose.Schema({
    userOneID: String, // User ones ID(username)
    userTwoID: String, // User two IDs(username)
    chatHistory: Array,
});

//               (Collection name, schema) 
let User = mongoose.model('Users', userSchema);
let Listing = mongoose.model('Listings', userSchema);
let Chat = mongoose.model('Chats', userSchema);

exports.myVar = () => {
    return "IN MY VAR";
}

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
            password: hash,
            isVerified: false,
            accountCreationDate: dateNow
        });

        // Saving user into database
        user.save((err, user) => {
            if (err) return console.error(err);
            console.log(user.firstName,"added.")
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
    let user = await User.findOne({ username: req.body.usernameoremail });
    let userByEmail = await User.findOne({ email: req.body.usernameoremail });


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
        let validPassword = await bcrypt.compare(req.body.password, userObject.password);
        if (validPassword) {
            // once user and pass are verified then we create a session with any key:value pair we want, which we can check for later
            req.session.user = {
                isAuthenticated: true,
                username: userObject.username,
                email: userObject.email,
            }
            console.log(`User: "${userObject.username}" was authenticated.`);
            //Once logged in redirect to this page
            res.redirect('/');
        } else {
            res.render('02_login', {
                title: 'Login',
                css_href: '/02_login.css',
                scriptsList: ["/02_login.js"],
                errors: { message: "Incorrect Credentials" }
            });
            console.log("Password is wrong");

        }

    }
}