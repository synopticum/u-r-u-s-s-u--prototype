var adminId = '257378450';

var logged = function (req, res) {
    if (req.user) {
        // check admin rules
        if (req.user.vkontakteId === adminId) {
            res.render('admin', { title: 'Admin' })
        }
        else res.render('user', { title: ' User' });
    }
    else {
        res.redirect('/join');
    }
};

var join = function (req, res) {
    res.render('login', { title: 'Node Login' });
};

var logout = function(req, res) {
    req.logout();
    res.redirect('/');
};

// exports
module.exports.logged = logged;
module.exports.join = join;
module.exports.logout = logout;