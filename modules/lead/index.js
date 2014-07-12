var utils = require('../../libs/util'),
    Lead  = require('../../models').Lead;

var adminId = '257378450',
    defaultText = 'Автор поленился набрать текст';

// lead
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

    var messageValid = new Lead(message);

    messageValid.save(function (err) {
        if (err) {
            utils.errorHandler(err, 'Lead Add Error');
            res.send(400, 'Bad Request');
        }
        res.send('Lead saved');
    });
};

var get = function (req, res) {
    Lead.find({}).sort('-date').exec(function (err, result) {
        if (err) {
            utils.errorHandler(err, 'Lead Get Error');
            res.send(400, 'Bad Request');
        }
        res.end(JSON.stringify(result));
    });
};

var edit = function (req, res) {
    if (req.user.vkontakteId === adminId) {

        Lead.update({ messageId: req.body.id }, { approved: true, text: utils.textValid(req.body.text) }, function (err) {
            if (err) {
                utils.errorHandler(err, 'Lead Edit Error');
                res.send(400, 'Bad Request');
            }
            res.end("Lead approved on server");
        });

        console.log("Lead approved on server");
    }
    else {
        res.send(403, "Access denied");
        console.log("User access error");
    }
};

var remove = function (req, res) {
    if (req.user.vkontakteId === adminId) {
        Lead.remove({ messageId: utils.textValid(req.body.id) }, function (err) {
            if (err) {
                utils.errorHandler(err, 'Lead Remove Error');
                res.send(400, 'Bad Request');
            }
            res.end("Lead removed from server");
        });

        console.log("Lead removed from server");
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