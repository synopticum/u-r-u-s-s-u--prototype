var utils = require('../../libs/util'),
    fs = require('fs'),
    Dot  = require('../../models').Dot;

var adminId = '257378450',
    defaultText = 'Автор поленился набрать текст',
    defaultLayer = 'main',
    defaultTitle = 'Это бывший заголовок',
    defaultIcon = 'green';

var send = function (req, res) {
    Dot.find(function (err, result) {
        if (err) throw err;
        res.end(JSON.stringify(result));
    });
};

var add = function (req, res) {
    var dotValues = JSON.parse(req.body.json);
    dotValues.id = utils.guid();

    var dotValidValues = {
        id          : utils.textValid(dotValues.id),
        layer       : utils.textValid(dotValues.layer, 50) || defaultLayer,
        position    : dotValues.position || [0,0],
        title       : utils.textValid(dotValues.title, 50) || defaultTitle,
        text        : utils.textValid(dotValues.text, 150) || defaultText,
        image       : 'marker-images/' + dotValues.image,
        icon        : utils.textValid(dotValues.icon, 20) || defaultIcon,
        address     : utils.textValid(dotValues.address, 10) || '-',
        street      : utils.textValid(dotValues.street, 40) || '-',
        house       : utils.textValid(dotValues.house, 4) || '-',
        homePhone   : utils.textValid(dotValues.homePhone, 20) || 'Не указан',
        track       : dotValues.track || null,
        mobilePhone : 'Не указан',
        gallery     : dotValues.gallery
    };

    // save in db
    var dotValid = new Dot(dotValidValues);

    dotValidValues.image = dotValues.image || 'images/q.gif';

    // create image
    if (!utils.isEmpty(req.files)) {
        // create gallery dir
        var galleryPath = 'public/galleries/' + dotValidValues.id;
        utils.mkdir(galleryPath);

        delete req.files.markerimage;

        // create gallery files
        for (var galleryImage in req.files) {
            var tmpGalleryPath = req.files[galleryImage].ws.path;
            var update = { gallery: [] };

            fs.readFile(tmpGalleryPath, function (err, result) {
                var imageName = (Math.random()*31337 | 0) + '.jpg';
                var imagePath = 'galleries/' + dotValidValues.id + '/' + imageName;

                update.gallery.push(imagePath);

                fs.writeFile('public/galleries/' + dotValidValues.id + '/' + imageName, result, function (err) {
                    if (err) throw err;

                    Dot.findOneAndUpdate({id: dotValidValues.id}, update, function (err) {
                        if (err) throw err;
                    });
                });
            });

            fs.unlink(tmpGalleryPath, function (err) {
                if (err) throw err;
                console.log('Temporary gallery image deleted');
            })
        }

        dotValid.save(function (err, dot) {
            if (err) throw err;
            res.send(JSON.stringify(dot));
        });
    }
    else {
        dotValid.image = 'images/q.gif';

        dotValid.save(function (err, dot) {
            if (err) throw err;
            res.end(JSON.stringify(dot));
        });
    }

    console.log("Dot added on server");
};

var edit = function (req, res) {
    if (req.user.vkontakteId === adminId) {
        var dotValues = JSON.parse(req.body.json);

        var dotValidValues = {
            id          : utils.textValid(dotValues.id),
            layer       : utils.textValid(dotValues.layer, 50) || defaultLayer,
            position    : dotValues.position || [0,0],
            title       : utils.textValid(dotValues.title, 50) || defaultTitle,
            text        : utils.textValid(dotValues.text, 150) || defaultText,
            icon        : utils.textValid(dotValues.icon, 20) || defaultIcon,
            address     : utils.textValid(dotValues.address, 10) || '-',
            street      : utils.textValid(dotValues.street, 40) || '-',
            house       : utils.textValid(dotValues.house, 4) || '-',
            homePhone   : utils.textValid(dotValues.homePhone, 20) || 'Не указан',
            mobilePhone : 'Не указан',
            gallery     : dotValues.gallery
        };

        if (dotValues.image) {
            dotValidValues.image = 'marker-images/' + dotValues.image;
        }

        // check files exists
        if (!utils.isEmpty(req.files)) {
            console.log('Dot update have files');
            // add image
            if (req.files.markerimage) {
                var tmpFilePath = req.files.markerimage.ws.path;

                fs.readFile(tmpFilePath, function (err, result) {
                    if (err) throw err;

                    fs.writeFile('public/marker-images/' + dotValidValues.id + '.png', result, function (err) {
                        if (err) throw err;

                        fs.unlink(tmpFilePath, function (err) {
                            if (err) throw err;
                            console.log('tmp file deleted');
                        })
                    });
                });
            }

            // create gallery files
            var galleryPath = 'public/galleries/' + dotValidValues.id;

            delete req.files.markerimage;

            fs.stat(galleryPath, function (err) {
                if (err) {
                    utils.mkdir(galleryPath);
                    console.log('Marker gallery created');
                }

                for (var galleryImage in req.files) {
                    var tmpGalleryPath = req.files[galleryImage].ws.path;
                    var update = { gallery: dotValidValues.gallery };
                    utils.mkdir('public/tmp');

                    fs.readFile(tmpGalleryPath, function (err, result) {
                        var imageName = (Math.random() * 31337 | 0) + '.jpg';
                        var imagePath = 'galleries/' + dotValidValues.id + '/' + imageName;

                        update.gallery.push(imagePath);

                        fs.writeFile('public/galleries/' + dotValidValues.id + '/' + imageName, result, function (err) {
                            if (err) throw err;

                            Dot.findOneAndUpdate({id: dotValidValues.id}, update, function (err, result) {
                                if (err) throw err;
                                console.log('Marker gallery updated');
                                res.end(JSON.stringify(result));
                            });
                        });
                    });

                    fs.unlink(tmpGalleryPath, function (err) {
                        if (err) throw err;
                        console.log('Temporary gallery image deleted');
                    })
                }
            });

            // save in db
            Dot.findOneAndUpdate({id: dotValidValues.id}, dotValidValues, function (err, result) {
                if (err) throw err;
                res.end(JSON.stringify(result));
            });

            console.log('image updated');
        }
        else {
            console.log('Dot update dont have files');
            delete dotValidValues.gallery;

            Dot.findOneAndUpdate({id: dotValidValues.id}, dotValidValues, function (err, result) {
                if (err) throw err;
                res.end(JSON.stringify(result));
            });
        }
    }
    else {
        res.send(403, "Access denied");
        console.log("User access error");
    }

    console.log("Dot updated on server");
};

var remove = function (req, res) {
    req.on("data", function (data) {
        if (req.user.vkontakteId === adminId) {
            var dotId = data.toString();

            // remove from db
            Dot.remove({ id: dotId }, function (err) {
                if (err) throw err;
                res.end("Dot removed from server");
            });

            // remove dot files if exists
            var markerPath = 'public/marker-images/' + dotId + '.png';
            var galleryPath = 'public/galleries/' + dotId;

            fs.stat(galleryPath, function (err) {
                if (err) {
                    console.log('Marker gallery don\'t exists');
                    return;
                }
                utils.deleteFolderRecursive(galleryPath, function (err) {
                    if (err) throw err;
                    console.log('Dot gallery deleted');
                });
            });

            fs.stat(markerPath, function (err) {
                if (err) {
                    console.log('Marker image don\'t exists');
                    return;
                }
                fs.unlink(markerPath, function (err) {
                    if (err) throw err;
                    console.log('Dot marker image deleted');
                });
            });
        }
        else {
            res.send(403, "Access denied");
            console.log("User access error");
        }
    });

    console.log("Dot removed from server");
};

// exports
module.exports.add = add;
module.exports.edit = edit;
module.exports.remove = remove;
module.exports.send = send;