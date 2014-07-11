var User  = require('../../models').User;

var all = function (req, res) {
    User.find(function (err, result) {
        if (err) utils.errorHandler(err, 'Users Get Error');
        res.end(JSON.stringify(result));
    });
};

module.exports.all = all;