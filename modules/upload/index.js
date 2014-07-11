var utils = require('../../libs/util'),
    gm = require('gm');

var singleImage = function (req, res) {
    if (!utils.isEmpty(req.files)) {
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

// exports
module.exports.singleImage = singleImage;
module.exports.markerImage = markerImage;