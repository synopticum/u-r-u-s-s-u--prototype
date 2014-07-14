var utils = require('../../libs/util'),
    Message  = require('../../models').Message;

var defaultText = 'Автор поленился набрать текст';

var add = function (req, res) {
    var message = {
        messageId    : 'm' + utils.guid(),
        dotId        : utils.textValid(req.body.id),
        name         : utils.textValid(req.user.displayName),
        link         : utils.textValid(req.user.username),
        text         : utils.textValid(req.body.text) || defaultText,
        avatar       : utils.textValid(req.user.avatar),
        image        : req.body.image,
        approved     : false
    };

    var messageValid = new Message(message);

    messageValid.save(function (err) {
        if (err) {
            utils.errorHandler(err, 'Messages Add Error');
            res.send(400, 'Bad Request');
        }
        res.send('saved');
    });
};

var get = function (req, res) {
    Message.find({}).sort('-date').exec(function (err, result) {
        if (err) {
            utils.errorHandler(err, 'Messages Get Error');
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
                Message.update({ messageId: utils.textValid(req.body.id) }, { approved: true, text: utils.textValid(req.body.text) || defaultText }, function (err) {
                    if (err) {
                        utils.errorHandler(err, 'Messages Edit Error');
                        res.send(400, 'Bad Request');
                    }
                    res.end("Message updated on server");
                });

                console.log("Message updated on server");
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
                Message.remove({ messageId: utils.textValid(req.body.id) }, function (err) {
                    if (err) {
                        utils.errorHandler(err, 'Messages Remove Error');
                        res.send(400, 'Bad Request');
                    }
                    res.end("Message removed from server");
                });

                console.log("Message removed from server");
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