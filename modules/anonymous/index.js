var utils = require('../../libs/util'),
    Anonymous  = require('../../models').Anonymous;

var adminId = '257378450',
    defaultText = 'Автор поленился набрать текст';

var add = function (req, res) {
    var message = {
        messageId    : 'm' + utils.guid(),
        name         : utils.anonymousName(),
        link         : utils.textValid(req.user.username),
        text         : utils.textValid(req.body.text) || defaultText,
        image        : req.body.image,
        approved     : false
    };

    var messageValid = new Anonymous(message);

    messageValid.save(function (err) {
        if (err) throw err;
        res.send('Anonymous saved');
    });
};

var get = function (req, res) {
    Anonymous.find(function (err, result) {
        if (err) throw err;
        res.end(JSON.stringify(result));
    });
};

var edit = function (req, res) {
    if (req.user.vkontakteId === adminId) {
        Anonymous.update({ messageId: utils.textValid(req.body.id) }, { approved: true, text: utils.textValid(req.body.text) || defaultText }, function (err) {
            if (err) throw err;
            res.end("Anonymous approved on server");
        });

        console.log("Anonymous approved on server");
    }
    else {
        res.send(403, "Access denied");
        console.log("User access error");
    }
};

var remove = function (req, res) {
    if (req.user.vkontakteId === adminId) {
        Anonymous.remove({ messageId: utils.textValid(req.body.id) }, function (err) {
            if (err) throw err;
            res.end("Anonymous removed from server");
        });

        console.log("Anonymous removed from server");
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