var utils = require('../../libs/util'),
    News  = require('../../models').News;

var defaultText = 'Автор поленился набрать текст';

// news
var add = function (req, res) {
    var message = {
        messageId    : 'm' + utils.guid(),
        name         : utils.textValid(req.user.displayName),
        link         : utils.textValid(req.user.username),
        text         : utils.textValid(req.body.text) || defaultText,
        avatar       : utils.textValid(req.user.avatar),
        image        : req.body.image
    };


    // check for premod
    User.findOne({ username: message.link }, function (err, result) {
        (result.status === 'premod') ? message.approved = false : message.approved = true;

        var messageValid = new News(message);

        messageValid.save(function (err) {
            if (err) {
                utils.errorHandler(err, 'News Add Error');
                res.send(400, 'Bad Request');
            }
            res.send('saved');
        });
    });
};

var get = function (req, res) {
    News.find({}).sort('-date').exec(function (err, result) {
        if (err) {
            utils.errorHandler(err, 'News Get Error');
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
                News.update({ messageId: utils.textValid(req.body.id) }, { approved: true, text: utils.textValid(req.body.text) || defaultText }, function (err) {
                    if (err) {
                        utils.errorHandler(err, 'News Edit Error');
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
                News.remove({ messageId: utils.textValid(req.body.id) }, function (err) {
                    if (err)  {
                        utils.errorHandler(err, 'News Remove Error');
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