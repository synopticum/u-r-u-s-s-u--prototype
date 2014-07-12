var utils = require('../../libs/util'),
    Ads  = require('../../models').Ads;

var adminId = '257378450',
    defaultText = 'Автор поленился набрать текст';

// ads
var add = function (req, res) {
    var message = {
        messageId    : 'm' + utils.guid(),
        name         : utils.textValid(req.user.displayName),
        link         : utils.textValid(req.user.username),
        text         : utils.textValid(req.body.text) || defaultText,
        avatar       : utils.textValid(req.user.avatar),
        image        : req.body.image,
        phone        : utils.textValid(req.body.phone),
        approved     : false
    };

    var messageValid = new Ads(message);

    messageValid.save(function (err) {
        if (err)  {
            utils.errorHandler(err, 'Ads Add Error');
            res.send(400, 'Bad Request');
        }
        res.send('Ad saved');
    });
};

var get = function (req, res) {
    Ads.find({}).sort('-date').exec(function (err, result) {
        console.log(result);
        if (err)  {
            utils.errorHandler(err, 'Ads Get Error');
            res.send(400, 'Bad Request');
        }
        res.end(JSON.stringify(result));
    });
};

var edit = function (req, res) {
    if (req.user.vkontakteId === adminId) {

        Ads.update({ messageId: req.body.id }, { approved: true, text: utils.textValid(req.body.text) }, function (err) {
            if (err)  {
                utils.errorHandler(err, 'Ads Edit Error');
                res.send(400, 'Bad Request');
            }
            res.end("Ad approved on server");
        });

        console.log("Ad approved on server");
    }
    else {
        res.send(403, "Access denied");
        console.log("User access error");
    }
};

var remove = function (req, res) {
    if (req.user.vkontakteId === adminId) {
        Ads.remove({ messageId: utils.textValid(req.body.id) }, function (err) {
            if (err)  {
                utils.errorHandler(err, 'Ads Remove Error');
                res.send(400, 'Bad Request');
            }
            res.end("Ad removed from server");
        });

        console.log("Ad removed from server");
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