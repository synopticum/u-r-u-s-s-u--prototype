var utils = require('../../libs/util'),
    Claims  = require('../../models').Claims;

var defaultText = 'Автор поленился набрать текст';

var add = function (req, res) {
    var message = {
        messageId    : 'm' + utils.guid(),
        name         : utils.textValid(req.user.displayName),
        link         : utils.textValid(req.user.username),
        text         : utils.textValid(req.body.text) || defaultText,
        avatar       : utils.textValid(req.user.avatar),
        image        : req.body.image,
        approved     : false
    };

    var messageValid = new Claims(message);

    messageValid.save(function (err) {
        if (err) {
            utils.errorHandler(err, 'Claims Add Error');
            res.send(400, 'Bad Request');
        }
        res.send('Claims saved');
    });
};

var get = function (req, res) {
    Claims.find({}).sort('-date').exec(function (err, result) {
        if (err) {
            utils.errorHandler(err, 'Claims Get Error');
            res.send(400, 'Bad Request');
        }
        res.end(JSON.stringify(result));
    });
};

var edit = function (req, res) {
    // check for admin
    User.findOne({ status: 'godlike' }, function (err, result){
        var godlike = result.get('_id').toString();

        if (req.user) {
            // if admin
            if (req.session.passport.user === godlike) {
                Claims.update({ messageId: req.body.id }, { approved: true, text: utils.textValid(req.body.text) }, function (err) {
                    if (err) {
                        utils.errorHandler(err, 'Claims Edit Error');
                        res.send(400, 'Bad Request');
                    }
                    res.end("Claims approved on server");
                });

                console.log("Claims approved on server");
            }
            else {
                res.send(403, "Access denied");
                console.log("User access error");
            }
        }
        // if user
        else {
            res.redirect('/join');
        }
    });
};

var remove = function (req, res) {
    // check for admin
    User.findOne({ status: 'godlike' }, function (err, result){
        var godlike = result.get('_id').toString();

        if (req.user) {
            // if admin
            if (req.session.passport.user === godlike) {
                Claims.remove({ messageId: utils.textValid(req.body.id) }, function (err) {
                    if (err) {
                        utils.errorHandler(err, 'Claims Remove Error');
                        res.send(400, 'Bad Request');
                    }
                    res.end("Claims removed from server");
                });

                console.log("Claims removed from server");
            }
            else {
                res.send(403, "Access denied");
                console.log("User access error");
            }
        }
        // if user
        else {
            res.redirect('/join');
        }
    });
};

// exports
module.exports.get = get;
module.exports.add = add;
module.exports.edit = edit;
module.exports.remove = remove;