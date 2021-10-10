







//// ROUTES ////

exports.index = (req, res) => {
    res.render('01_index', {
        title: 'Home',
        css_href: '/01_index.css',
        user: {isAuthenticated: false}
    });
}

exports.login = (req, res) => {
    res.render('02_login', {
        title: 'Login',
        css_href: '/02_login.css',
    });
}

exports.register = (req, res) => {
    res.render('03_register', {
        title: 'Login',
        css_href: '/03_register.css',
    });
}