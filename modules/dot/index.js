var utils = require('../../libs/util'),
    fs = require('fs'),
    Dot = require('../../models').Dot;

var defaultText = 'Автор поленился набрать текст',
    defaultLayer = 'main',
    defaultTitle = 'Это бывший заголовок',
    defaultIcon = 'green';

var send = function (req, res) {
    Dot.find(function (err, result) {
        if (err) {
            utils.errorHandler(err, 'Dots Send Error');
            res.send(400, 'Bad Request');
        }
        res.end(JSON.stringify(result));
    });
};

var add = function (req, res) {
    var dotValues = JSON.parse(req.body.json);
    dotValues.id = utils.guid();

    var dotValidValues = {
        id: utils.textValid(dotValues.id),
        layer: utils.textValid(dotValues.layer, 50) || defaultLayer,
        position: dotValues.position || [0, 0],
        title: utils.textValid(dotValues.title, 50) || defaultTitle,
        text: utils.textValid(dotValues.text, 150) || defaultText,
        image: 'marker-images/' + dotValues.image,
        icon: utils.textValid(dotValues.icon, 20) || defaultIcon,
        address: utils.textValid(dotValues.address, 10) || '-',
        street: utils.textValid(dotValues.street, 40) || '-',
        house: utils.textValid(dotValues.house, 4) || '-',
        homePhone: utils.textValid(dotValues.homePhone, 20) || 'Не указан',
        track: dotValues.track || null,
        mobilePhone: 'Не указан',
        gallery: dotValues.gallery
    };

    // save in db
    var dotValid = new Dot(dotValidValues);

    dotValidValues.image = dotValues.image || 'images/q.gif';

    dotValid.save(function (err, dot) {
        if (err) {
            utils.errorHandler(err, 'Dot Add Error (without files)');
            res.send(400, 'Bad Request');
        }
        res.end(JSON.stringify(dot));
    });
};

var edit = function (req, res) {
    // check for admin
    User.findOne({ status: 'godlike' }, function (err, result){
        var godlike = result.get('_id').toString();

        if (req.user) {
            // if admin
            if (req.session.passport.user === godlike) {
                var dotValues = JSON.parse(req.body.json);

                var dotValidValues = {
                    id: utils.textValid(dotValues.id),
                    layer: utils.textValid(dotValues.layer, 50) || defaultLayer,
                    position: dotValues.position || [0, 0],
                    title: utils.textValid(dotValues.title, 50) || defaultTitle,
                    text: utils.textValid(dotValues.text, 150) || defaultText,
                    icon: utils.textValid(dotValues.icon, 20) || defaultIcon,
                    address: utils.textValid(dotValues.address, 10) || '-',
                    street: utils.textValid(dotValues.street, 40) || '-',
                    house: utils.textValid(dotValues.house, 4) || '-',
                    homePhone: utils.textValid(dotValues.homePhone, 20) || 'Не указан',
                    track: dotValues.track || null,
                    mobilePhone: 'Не указан',
                    gallery: dotValues.gallery
                };

                if (dotValues.image) {
                    dotValidValues.image = 'marker-images/' + dotValues.image;
                }

                delete dotValidValues.gallery;

                Dot.findOneAndUpdate({id: dotValidValues.id}, dotValidValues, function (err, result) {
                    if (err) {
                        utils.errorHandler(err, 'Dot Edit Error (without files)');
                        res.send(400, 'Bad Request');
                    }
                    res.end(JSON.stringify(result));
                });
            }
            else {
                res.send(403, "Access denied");
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
                var dotId = req.body.id;

                // remove from db
                Dot.remove({ id: dotId }, function (err) {
                    if (err) {
                        utils.errorHandler(err, 'Dot Remove Error');
                        res.send(400, 'Bad Request');
                    }
                    res.end("Dot removed from server");
                });

                // remove gallery files
                var galleryFiles = req.body.galleryFiles.split(',');

                for (var i = 0; i < galleryFiles.length; i++) {
                    var filePath = 'public/galleries/' + galleryFiles[i];

                    if (fs.existsSync(filePath)) {
                        fs.unlink(filePath);
                    }
                }
            }
            else {
                res.send(403, "Access denied");
            }
        }
        // if user
        else {
            res.redirect('/join');
        }
    });
};

// exports
module.exports.add = add;
module.exports.edit = edit;
module.exports.remove = remove;
module.exports.send = send;