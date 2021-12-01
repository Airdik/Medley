//// CONNECTING/SETUP DB ////
const mongoose = require('mongoose');
const config = require('./config.json');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail')
const email = require('../helpers/email');
const moment = require('moment');
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
    accountCreationDate: Date, // User's account creation date
    chats: [String],
    reputation: [
        {
            totalRatingsSum: Number,
            numberOfRaters: {type:Number, default:1},
            averageRating: { type: mongoose.Schema.Types.Decimal128, default: 5 }, // = totalRatingsSum/numberOfRaters
        }
    ],
    ratedUsers: [mongoose.Schema.Types.ObjectId],
    ratings: [
        {
            ratedBy: mongoose.Schema.Types.ObjectId,
            ratedByUsername: String,
            rating: Number,
            comment: String,
        }
    ]
});
let listingSchema = mongoose.Schema({
    belongsTo: String, // User ID this listing belongs to
    listingToken: String, // Token that is used to identify images that belong to this listing
    title: String, // Title of the listing
    description: String, // Description of the problem
    willingToPay: Number, // Amount willing to pay the assistor
    locationOfProblem: String, // The location where the problem occurred
    coordinatesOfProblem: String, // The coordinates
    views: { type: Number, default: 0 }, // Number of times the listing has been viewed
});
let chatSchema = mongoose.Schema({
    chatToken: String,
    userOneID: String, // User ones ID(username), first sender
    userTwoID: String, // User two IDs(username)
    listingToken: String,
    messages: [
        {
            content: String,
            sentBy: mongoose.Schema.Types.ObjectId,
            timestamp: String,
            seen: {type: Boolean, default: false}
        }
    ]

});

//               (Collection name, schema) 
let User = mongoose.model('Users', userSchema);
let Listing = mongoose.model('Listings', listingSchema);
let Chat = mongoose.model('Chats', chatSchema);


exports.AddUser = async (req, res) => {

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

            email.sendVerifyEmailMessage(user.email, user.emailToken)
            
        });
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

exports.listingSendChat = async (from, obj, cb) => {

    let message = {
        content: obj.content,
        sentBy: from,
        timestamp: moment().format('h:mm a'),
        seen: false
    };

    console.log("userOneID:", from);
    console.log("userTwoID:", obj.to);
    console.log("listingToken:", obj.listingToken);

    let chat = await Chat.findOne({ $and: [{ userOneID: from, userTwoID: obj.to, listingToken: obj.listingToken }] });

    if (chat == null) { // means a brand new chat between the two users about a new listing
        
        let chat = new Chat({
            chatToken: crypto.randomBytes(16).toString('hex'),
            userOneID: from,
            userTwoID: obj.to,
            listingToken: obj.listingToken,
            messages: message
            
        });

        chat.save(async (err, chat) => {
            if (err) return console.error(err);
            console.log("SAVED CHAT::", chat);
            let userOne = await User.findById(chat.userOneID);
            let userTwo = await User.findById(chat.userTwoID);

            userOne.chats.push(chat.chatToken);
            userTwo.chats.push(chat.chatToken);

            userOne.save(async (err, user) => {
                if (err) return console.error(err);
                console.log(user);
            });
            userTwo.save(async (err, user) => {
                if (err) return console.error(err);
                console.log(user);
            });
            cb(true);
        });

    } else { // means the two users have a chat already about this particular listing
        chat.messages.push(message);
        chat.save(async (err, chat) => {
            if (err) return console.error(err);
            console.log("Chat pushed::", chat);
            cb(true);
        });
    }
}

exports.sendChat = async (from, chatToken, message, callback) => {
    let msg = {
        content: message,
        sentBy: from,
        timestamp: moment().format('h:mm a')
    }

    let chat = await Chat.findOne({ chatToken: chatToken });
    chat.messages.push(msg);
    chat.save(async (err, chat) => {
        if (err) return console.error(err);
        callback(true);
    });
}

exports.usersRatings = async (req, res) => {
    res.render('07_userRatings', {
        title: 'Ratings',
        css_href: '/07_userRatings.css',
        scriptsList: ["/07_userRatings.js"],
    });

}

// API
exports.apiGetListings = async (req, res) => {
    let title = req.query.title;
    let description = req.query.description;
    let price = req.query.price;

    let filter = [];
    let listing;

    if (!title && !description && (!price || price == "placeholder")) {
        listing = await Listing.find().lean().exec();

    }else { // Filter based on what user is trying to filter with
        if (title) {
            console.log("here title")
            filter.push({ "title": { "$regex": `${title}`, "$options": "i" } });
        }
        if (description) {
            filter.push({ "description": { "$regex": `${description}`, "$options": "i" } })
        }
        if (price != "placeholder") {
            console.log("price::", price);
            filter.push({ willingToPay: { $gte: `${price}` } })
        }
        // More filters can go here

        // At least one filter will be added
        listing = await Listing.find({ $or: filter }).lean().exec();
    }
    

    
    let fullListingJson = [];
    for (let i = 0; i < listing.length; i++){

        let listingPoster = await User.findById(listing[i].belongsTo); // Listing filter would go 
        let listingPosterAvgRating = 5.0;
        let listingPosterNumOfRaters = 1;
        if (listingPoster.reputation[0]) {
            console.log("::IN HERE FOR::", listingPoster.username);
            listingPosterAvgRating = listingPoster.reputation[0].averageRating;
            listingPosterNumOfRaters = listingPoster.reputation[0].numberOfRaters;
        }
        let tempJson = {
            "listingPosterID": listingPoster._id,
            "listingTitle": listing[i].title,
            "listingToken": listing[i].listingToken,
            "listingPoster": listingPoster.username,
            "listingPosterEmail": listingPoster.email,
            "description": listing[i].description,
            "price": listing[i].willingToPay,
            "location": listing[i].locationOfProblem,
            "views": listing[i].views,
            "averageRating": listingPosterAvgRating,
            "numOfRaters": listingPosterNumOfRaters,
        }
        fullListingJson.push(tempJson);
    }

    res.json(fullListingJson);
}

exports.apiSendMessage = async (req, res) => {

    
    let message = req.query.message;
    let fromUser = await User.findById(req.session.user.userID)
    let toUser = await User.findById(req.query.to)
    let listing = await Listing.findOne({ listingToken: req.query.listingToken });

    let fromData = {
        username: fromUser.username,
        email: fromUser.email
    }
    let toData = {
        firstName: toUser.firstName,
        email: toUser.email,
    }
    let listingData = {
        title: listing.title
    }

    console.log("db.js::Starting to send message.");
    email.sendUserAcceptedListing(message, fromData, toData, listingData);
}

exports.apiListingViewed = async (req, res) => {
    let token = req.query.token;
    Listing.findOneAndUpdate({ listingToken: token }, { $inc: { 'views': 1 } }).then(() => {
    }).catch((err) => {
        console.log("::LISTINGVIEWED::", err)
    });
}

exports.getRecentChats = async (userID, callback) => {

    let user = await User.findById(userID);
    let activeChats = user.chats;
    
    console.log("USER::", user);
    console.log("USERNAME::", user.username);
    console.log("ACTIVE CHATS::", activeChats);
    if (activeChats) {
        console.log("IN HERE 2");
        let recentChats = [];
        for (let i = 0; i < activeChats.length; i++) {
            let chat = await Chat.findOne({ chatToken: activeChats[i] });
            let listingTitle = await Listing.findOne({ listingToken: chat.listingToken });
            let chattingWith = `${chat.userOneID}` == `${userID}` ? await User.findOne({ _id: chat.userTwoID }) : await User.findOne({ _id: chat.userOneID });
        
            let recentChat = {
                chatToken: chat.chatToken,
                listingTitle: listingTitle.title,
                chattingWith: chattingWith.username,
                chattingWithID: chattingWith._id
            }
            recentChats.push(recentChat);
        }
        callback(recentChats);
    } else {
        callback(false); // No chats found
    }

}

exports.getChatContents = async (chatToken, userIDofRequester, callback) => {
    let chat = await Chat.findOne({ chatToken: chatToken });
    
    if (chat != null) {
        console.log("Searching for requestor:", userIDofRequester);
        let requesterUsername = await User.findById(userIDofRequester);
        requesterUsername = requesterUsername.username;

        let otherUser;
        if (chat.userOneID == userIDofRequester) {
            let user = await User.findById(chat.userTwoID);
            otherUser = user.username;
        } else {
            let user = await User.findById(chat.userOneID);
            otherUser = user.username;
        }


        callback({ message: chat.messages, self:requesterUsername, otherUser:otherUser });
    } else {
        callback(false);
    }
}

exports.getUsernameFromID = async (userID, callback) => {
    console.log("In getusernamefromid in DB");
    let user = await User.findById(userID);
    if (user != null) {
        console.log("Sending username:",user.username)
        callback(user.username);
    } else {
        console.log("Didn't find user with userID:", userID);
        callback(false);
    }
}

exports.rateUser = async (ratedByID, rateUserID, rating, comment, callback) => {
    // Check if the user (ratedByID) has rated this user (rateUserID) already
    let test = await User.findOne({ $and: [{ _id: ratedByID }, { ratedUsers: rateUserID }] });
    
    if (test == null) {
        let user = await User.findById(ratedByID);
        console.log("USER:", user);
        console.log("IN HERE:", user.username);
        console.log("IN HERE2:", user.ratedUsers);
        let rateUser = await User.findById(rateUserID); // The user the current user is about to rate
        if (rateUser != null) {

            let ratingObj = {
                ratedBy: ratedByID,
                ratedByUsername: user.username,
                rating: rating,
                comment: comment
            }

            rateUser.ratings.push(ratingObj);
            console.log("RATE USER::", rateUser);
            if (rateUser.reputation[0]) {
                rateUser.reputation[0].totalRatingsSum += rating;
                rateUser.reputation[0].numberOfRaters += 1;
                rateUser.reputation[0].averageRating = (rateUser.reputation[0].totalRatingsSum / rateUser.reputation[0].numberOfRaters);
            } else {
                let reputation = {
                    totalRatingsSum: rating,
                    numberOfRaters: 1,
                    averageRating: rating, // = totalRatingsSum/numberOfRaters

                }
                rateUser.reputation.push(reputation);
            }

            rateUser.save(async (err, rate_user) => {
                if (err) return console.error(err)

                user.ratedUsers.push(rateUserID);
                user.save(async (err, user) => {
                    if (err) return console.error(err);
                    callback(true);
                });

            });

            
        } else {
            callback(false);
        }

    } else {
        console.log("User already rated!")
        callback(false);
    }
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
    });
}