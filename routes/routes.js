const path = require('path');
const bcrypt = require('bcryptjs'); // For password hashing
const db = require('../helpers/db'); // Handles all DB stuff
const email = require('../helpers/email'); // Handles all email stuff





//// ROUTES ////

exports.index = (req, res) => {
    
    res.render('01_index', {
        title: 'Home',
        css_href: '/01_index.css',
        scriptsList: ["/01_index.js"],
        user: req.session.user == undefined ? false : req.session.user,

    });
   
}

exports.login = (req, res) => {
    res.render('02_login', {
        title: 'Login',
        css_href: '/02_login.css',
        scriptsList: ["/02_login.js"],
    });
}

exports.register = (req, res) => {
    res.render('03_register', {
        title: 'Register',
        css_href: '/03_register.css',
        scriptsList: ["/03_register.js"],
    });
}
exports.registerSuccess = async (req, res) => {
    db.AddUser(req, res);
}

exports.verifyLogin = async (req, res) => {
    db.TryLogin(req, res);
}

exports.viewListings = (req, res) => {
    res.render('04_viewListings', {
        title: 'Listings',
        css_href: '/04_viewListings.css',
        scriptsList: ["/04_viewListings.js"],
    });
}

exports.createListing = (req, res) => {
    res.render('05_createListing', {
        title: 'Create Listing',
        css_href: '/05_createListing.css',
        scriptsList: ["/05_createListing.js"],
    });
}
exports.createListingSuccess = async (req, res) => {
    db.createListingSuccess(req, res);
}


// API
exports.apiGetListings = (req, res) => {
    db.apiGetListings(req, res);
}

// _pages
exports.verifyUserEmail = (req, res) => {
    db.verifyUserEmail(req, res);
}