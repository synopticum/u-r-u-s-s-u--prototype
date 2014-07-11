var utils = require('../../libs/util'),
    fs = require('fs'),
    gm = require('gm');

var singleImage = function (req, res) {
    if (!utils.isEmpty(req.files)) {
        console.log(req.files);
        if (req.files.image) {
            if (req.files.image.type === 'image/jpeg') {
                var tmpFilePath = req.files.image.ws.path;
                var fileName = utils.makeFileName() + '.jpg';

                gm(tmpFilePath)
                    .options({imageMagick: true})
                    .resize(1280, 800)
                    .autoOrient()
                    .write('public/msgimages/' + fileName, function (err) {
                        if (err) {
                            utils.errorHandler(err, 'Upload Error (write single image)');
                        }
                        console.log('marker image converted');
                        res.end(fileName);
                    });
            }
            else res.send(400, 'Принимаются только изображения в формате JPG.');
        }
        else res.send(400, 'Accept file error');
    }
    else res.send(400, 'Accept file error');
};

var markerImage = function (req, res) {
    if (!utils.isEmpty(req.files)) {
        if (req.files.image) {
            if (req.files.image.type === 'image/jpeg') {
                var tmpFilePath = req.files.image.ws.path;
                var fileName = utils.makeFileName() + '.jpg';

                gm(tmpFilePath)
                    .options({imageMagick: true})
                    .resize(80, 80)
                    .autoOrient()
                    .write('public/marker-images/' + fileName, function (err) {
                        if (err) {
                            utils.errorHandler(err, 'Upload Error (write marker image)');
                            res.send(400, 'Bad Request');
                        }
                        console.log('marker image converted');
                        res.end(fileName);
                    });
            }
            else res.send(400, 'Принимаются только изображения в формате JPG.');
        }
        else res.send(400, 'Accept file error');
    }
    else res.send(400, 'Accept file error');
};

var galleryImages = function (req, res) {
    fs.readdir('public/galleries', function (err) {
        var files = req.files.galleryImages;

        var results = [];
        var keys = Object.keys(req.files.galleryImages);
        (function next(index) {
            if (index === keys.length) { // No items left
                results = JSON.stringify(results);
                res.end(results);
                return;
            }

            var tmpFilePath = files[index].ws.path;
            var fileName = utils.makeFileName() + '.jpg';

            gm(tmpFilePath)
                .options({imageMagick: true})
                .resize(80, 80)
                .autoOrient()
                .write('public/galleries/' + fileName, function (err) {
                    if (err) {
                        utils.errorHandler(err, 'Upload Error (write marker image)');
                        res.send(400, 'Bad Request');
                    }
                    console.log('marker image converted');
                });

            results.push(fileName);
            next(index + 1);
        })(0);

//        if(!err) {
//            for (var i = 0; i < files.length; i++) {
//                (function(i) {
//                    var tmpFilePath = files[i].ws.path;
//                    var fileName = utils.makeFileName() + '.jpg';
//
//                    gm(tmpFilePath)
//                        .options({imageMagick: true})
//                        .resize(80, 80)
//                        .autoOrient()
//                        .write('public/gallery2/' + fileName, function (err) {
//                            if (err) {
//                                utils.errorHandler(err, 'Upload Error (write marker image)');
//                                res.send(400, 'Bad Request');
//                            }
//                            console.log('marker image converted');
//                            filesUploaded.push(fileName);
//                            console.log(filesUploaded);
//                        });
//
//                        fs.stat(tmpFilePath, function(stat){
//                            if (stat.isFile()){
//                                filesOnly[i] = stat;
//                            }
//                        });
//                })(i);
//            }
//        }
//        else throw err;
    });
};

// exports
module.exports.singleImage = singleImage;
module.exports.markerImage = markerImage;
module.exports.galleryImages = galleryImages;