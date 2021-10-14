







//// ROUTES ////

exports.index = (req, res) => {
    res.render('01_index', {
        title: 'Home',
        css_href: '/01_index.css',
        scriptsList: ["/01_index.js"],
        user: {isAuthenticated: false}
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
        title: 'Login',
        css_href: '/03_register.css',
        scriptsList: ["/03_register.js"],
    });
}