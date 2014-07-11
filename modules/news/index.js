var utils = require('../../libs/util'),
    News  = require('../../models').News;

var adminId = '257378450',
    defaultText = 'Автор поленился набрать текст';

// news
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

    var messageValid = new News(message);

    messageValid.save(function (err) {
        if (err) {
            utils.errorHandler(err, 'News Add Error');
            res.send(400, 'Bad Request');
        }
        res.send('saved');
    });
};

var get = function (req, res) {
    News.find({ $query: {} }, function (err, result) {
        if (err) {
            utils.errorHandler(err, 'News Get Error');
            res.send(400, 'Bad Request');
        }
        res.end(JSON.stringify(result));
    });
};

var edit = function (req, res) {
    if (req.user.vkontakteId === adminId) {
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
};

var remove = function (req, res) {
    if (req.user.vkontakteId === adminId) {
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
};

// exports
module.exports.get = get;
module.exports.add = add;
module.exports.edit = edit;
module.exports.remove = remove;