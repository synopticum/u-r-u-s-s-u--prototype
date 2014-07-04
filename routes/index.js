var multipart = require('connect-multiparty');
var fs = require('fs');
var multipartMiddleware = multipart( { uploadDir: 'public/tmp' });

var utils = require('../libs/util.js');
var Dot = require('../models/dot').Dot;

var tmpDir = 'public/tmp';

module.exports = function (app) {
    app.get('/', index);
    app.get('/login', login);
    app.get('/dots', sendDots);


    app.post('/dot', multipartMiddleware, addDot);
    app.put('/dot', multipartMiddleware, editDot);
    app.delete('/dot', removeDot);
};

var index = function (req, res) {
    res.render('index', { title: 'Node Boilerplate' });
};

var login = function (req, res) {
    res.render('login', { title: 'Node Login' });
};

var sendDots = function (req, res) {
    Dot.find(function (err, person) {
        if (err) return handleError(err);
        res.end(JSON.stringify(person));
    });
};

var addDot = function (req, res) {
    var dotValues = JSON.parse(req.body.json);
    dotValues.id = utils.guid();
    dotValues.image = 'marker-images/' + dotValues.id + '.png';

    // save in db
    var dotValid = new Dot(dotValues);

    // create image
    if (!utils.isEmpty(req.files)) {
        // add image
        if (req.files.markerimage) {
            var tmpFilePath = req.files.markerimage.ws.path;

            fs.readFile(tmpFilePath, function (err, result) {
                if (err) throw err;

                fs.writeFile('public/marker-images/' + dotValues.id + '.png', result, function (err) {
                    if (err) throw err;

                    fs.unlink(tmpFilePath, function (err) {
                        if (err) throw err;
                        console.log('Temporary marker file deleted');
                    })
                });
            });
        }
        else {
            dotValues.image = 'images/q.gif';
        }

        // create gallery dir
        var galleryPath = 'public/galleries/' + dotValues.id;
        utils.mkdir(galleryPath);

        delete req.files.markerimage;

        // create gallery files
        for (var galleryImage in req.files) {
            var tmpGalleryPath = req.files[galleryImage].ws.path;
            var update = { gallery: [] };

            fs.readFile(tmpGalleryPath, function (err, result) {
                var imageName = (Math.random()*31337 | 0) + '.jpg';
                var imagePath = 'galleries/' + dotValues.id + '/' + imageName;

                update.gallery.push(imagePath);

                fs.writeFile('public/galleries/' + dotValues.id + '/' + imageName, result, function (err) {
                    if (err) throw err;

                    Dot.findOneAndUpdate({id: dotValues.id}, update, function (err, result) {
                        if (err) throw err;
                    });
                });
            });
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

var editDot = function (req, res) {
    var dotValues = JSON.parse(req.body.json);
    dotValues.image = 'marker-images/' + dotValues.id + '.png';

    if (!utils.isEmpty(req.files)) {
        console.log('Dot update have files');
        // add image
        if (req.files.markerimage) {
            var tmpFilePath = req.files.markerimage.ws.path;

            fs.readFile(tmpFilePath, function (err, result) {
                if (err) throw err;

                fs.writeFile('public/marker-images/' + dotValues.id + '.png', result, function (err) {
                    if (err) throw err;

                    fs.unlink(tmpFilePath, function (err) {
                        if (err) throw err;
                        console.log('tmp file deleted');
                    })
                });
            });
        }

        // create gallery files
        var galleryPath = 'public/galleries/' + dotValues.id;

        delete req.files.markerimage;

        fs.stat(galleryPath, function (err, status) {
            if (err) {
                utils.mkdir(galleryPath);
                console.log('Marker gallery created');
            }

            for (var galleryImage in req.files) {
                var tmpGalleryPath = req.files[galleryImage].ws.path;
                var update = { gallery: dotValues.gallery };
                utils.mkdir(tmpDir);

                fs.readFile(tmpGalleryPath, function (err, result) {
                    var imageName = (Math.random()*31337 | 0) + '.jpg';
                    var imagePath = 'galleries/' + dotValues.id + '/' + imageName;

                    update.gallery.push(imagePath);

                    fs.writeFile('public/galleries/' + dotValues.id + '/' + imageName, result, function (err) {
                        if (err) throw err;

                        Dot.findOneAndUpdate({id: dotValues.id}, update, function (err, result) {
                            if (err) throw err;
                            console.log('Marker gallery updated');
                            res.end(JSON.stringify(result));
                        });
                    });
                });
            }
        });

        // save in db
        Dot.findOneAndUpdate({id: dotValues.id}, dotValues, function (err, result) {
            if (err) throw err;
            res.end(JSON.stringify(result));
        });

        console.log('image updated');
    }
    else {
        console.log('Dot update dont have files');
        delete dotValues.gallery;

        Dot.findOneAndUpdate({id: dotValues.id}, dotValues, function (err, result) {
            if (err) throw err;
            res.end(JSON.stringify(result));
        });
    }

    console.log("Dot updated on server");
};

var removeDot = function (req, res) {
    req.on("data", function (data) {
        var dotId = data.toString();

        // remove from db
        Dot.remove({ id: dotId }, function (err) {
            if (err) throw err;
            res.end("Dot removed from server");
        });

        // remove dot files if exists
        var markerPath = 'public/marker-images/' + dotId +'.png';
        var galleryPath = 'public/galleries/' + dotId;

        fs.stat(galleryPath, function (err, status) {
            if (err) {
                console.log('Marker gallery don\'t exists');
                return;
            }
            utils.deleteFolderRecursive(galleryPath, function (err) {
                if (err) throw err;
                console.log('Dot gallery deleted');
            });
        });

        fs.stat(markerPath, function (err, status) {
            if (err) {
                console.log('Marker image don\'t exists');
                return;
            }
            fs.unlink(markerPath, function (err) {
                if (err) throw err;
                console.log('Dot marker image deleted');
            });
        });
    });

    console.log("Dot removed from server");
};