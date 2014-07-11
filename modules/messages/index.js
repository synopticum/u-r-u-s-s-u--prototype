var utils = require('../../libs/util'),
    Message  = require('../../models').Message;

var adminId = '257378450',
    defaultText = 'Автор поленился набрать текст';

var add = function (req, res) {
    console.log(req.body.image);

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
    Message.find(function (err, result) {
        if (err) {
            utils.errorHandler(err, 'Messages Get Error');
            res.send(400, 'Bad Request');
        }
        res.end(JSON.stringify(result));
    });
};

var edit = function (req, res) {
    if (req.user.vkontakteId === adminId) {
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
};

var remove = function (req, res) {
    if (req.user.vkontakteId === adminId) {
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
};

// exports
module.exports.get = get;
module.exports.add = add;
module.exports.edit = edit;
module.exports.remove = remove;