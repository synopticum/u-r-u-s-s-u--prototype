var User  = require('../../models').User;

var all = function (req, res) {
    User.find(function (err, result) {
        if (err) utils.errorHandler(err, 'Users Get Error');
        res.end(JSON.stringify(result));
    });
};

var edit = function (req, res) {
    User.findOne({ vkontakteId: req.body.id}, function (err, result) {
        if (err) utils.errorHandler(err, 'Users Get Error');
        result.status = req.body.status;
        result.save();

        res.end(JSON.stringify(result));
    });
};

module.exports.all = all;
module.exports.edit = edit;