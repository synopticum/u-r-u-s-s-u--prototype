User = require('../../models').User;

var logged = function (req, res) {
    // check for admin
    User.findOne({ status: 'godlike' }, function (err, result){
        var godlike = result.get('_id').toString();

        if (req.user) {
            if (req.session.passport.user === godlike) {
                res.render('admin', { title: 'Admin' })
            }
            else res.render('user', { title: ' User' });
        }
        else {
            res.redirect('/join');
        }
    });
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