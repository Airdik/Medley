//// CONNECTING/SETUP DB ////
const mongoose = require('mongoose');
const config = require('./config.json');

mongoose.Promise = global.Promise;
mongoose.connect(`mongodb+srv://${config.DB_USERNAME}:${config.DB_PASSWORD}@medley.7kwux.mongodb.net/${config.DB_DatabaseName}?retryWrites=true&w=majority`, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})
    .then((result) => {
        console.log("Connection to MedleyDB successful");
        mongoose.connection.db.listCollections().toArray(function (err, names) {
            console.log(names); 
            module.exports.Collection = names;
        });

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
    isVerified: Boolean, // Has the user's email been verified?
    accountCreationDate: Date, // User's account creation date
    password: String, // User's password
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

console.log("In db.js");