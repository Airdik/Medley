const path = require('path');
const bcrypt = require('bcryptjs'); // For password hashing
const db = require('../helpers/db'); // Handles all DB stuff
const email = require('../helpers/email'); // Handles all email stuff
const config = require('../helpers/config.json');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const crypto = require('crypto');
const fs = require('fs');

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
    // Unique token to identify images for the listing

    res.render('05_createListing', {
        title: 'Create Listing',
        css_href: '/05_createListing.css',
        listingToken: crypto.randomBytes(16).toString('hex'),
        scriptsList: ["/05_createListing.js"],
    });
}
exports.createListingSuccess = async (req, res) => {
    console.log(req.files);
    db.createListingSuccess(req, res);
}


// API
exports.apiGetListings = (req, res) => {
    db.apiGetListings(req, res);
}
exports.apiGetListingImages = (req, res) => {

    var folder = fs.readdirSync('./ListingImages/' + req.query.listingToken);
    var objArray = [];

    var obj = {};
    // var file = fs.readdirSync('./ListingImages/' + req.query.listingToken + '/' + document);
    obj.file = folder;
    objArray.push(obj);
    
    res.json(objArray);
}
exports.apiCurrentLocation = async (req, res) => {
    try {
        let locationDate = fetch(`http://open.mapquestapi.com/geocoding/v1/reverse?key=${config.MAPQUEST_API_KEY}&location=${req.query.lat},${req.query.lng}`)
            .then(response => response.json())
            .then((data) => {
                let cl = data.results[0].locations[0];
                let address = { address: `${cl.street}, ${cl.adminArea5} ${cl.adminArea3}, ${cl.postalCode}`, map: `${cl.mapUrl}` }
                console.log("ADDRESS:", address);
                res.json(address);
                return;
            });
    } catch (e) {
        res.json("");
        return;
    }
}
exports.apiSendMessage = (req, res) => {
    db.apiSendMessage(req, res);
}

exports.apiGetMapImage = async (req, res) => {
    //http://www.mapquestapi.com/geocoding/v1/address?key=${config.MAPQUEST_API_KEY}&location=Washington,DC
    let url = `http://www.mapquestapi.com/staticmap/v5/map?key=${config.MAPQUEST_API_KEY}&type=map&size=688,310&locations=${req.query.location}&zoom=15`
    let img = { mapUrl: `${url}` }
    res.json(img)

}

// _pages
exports.verifyUserEmail = (req, res) => {
    db.verifyUserEmail(req, res);
}