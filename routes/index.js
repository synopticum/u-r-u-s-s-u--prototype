var multipart = require('connect-multiparty');
var fs = require('fs');
var multipartMiddleware = multipart( { uploadDir: 'public/tmp' });

var utils = require('../libs/util.js');
var Dot = require('../models/dot').Dot;

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

    // create image
    if (!utils.isEmpty(req.files)) {
        // add image
        if (req.files.file_0) {
            var tmpFilePath = req.files.file_0.ws.path;

            fs.readFile(tmpFilePath, function (err, result) {
                if (err) throw err;

                fs.writeFile('public/marker-images/' + dotValues.id + '.png', result, function (err) {
                    if (err) throw err;
                });
            });
        }

        // add gallery
        fs.mkdir('public/galleries/' + dotValues.id, 0755, function (err) {
            if (err) throw err;
        });

        for (var galleryImage in req.files) {
            var tmpGalleryPath = req.files[galleryImage].ws.path;
            var update = { gallery: [] };

            fs.readFile(tmpGalleryPath, function (err, result) {
                var imageName = (Math.random()*31337 | 0) + '.jpg';
                var imagePath = 'galleries/' + dotValues.id + '/' + imageName;

                update.gallery.push(imagePath);

                fs.writeFile('public/galleries/' + dotValues.id + '/' + imageName, result, function (err) {
                    if (err) throw err;
                });

                Dot.findOneAndUpdate({id: dotValues.id}, update, function (err) {
                    if (err) throw err;
                    res.end(JSON.stringify(dotValues));
                });
            });
        }
    }

    // save in db
    var dotValid = new Dot(dotValues);
    dotValid.image = 'marker-images/' + dotValues.id + '.png';

    dotValid.save(function (err, dot) {
        if (err) throw err;
        res.end(JSON.stringify(dot));
    });

    console.log("Dot added on server");

    req.on("data", function (data) {
    });
};

var editDot = function (req, res) {
    var dotValues = JSON.parse(req.body.json);

    if (!utils.isEmpty(req.files)) {
        var tmpFilePath = req.files.file_0.ws.path;
        var tmpFile = fs.readFileSync(tmpFilePath);

        fs.writeFileSync('public/marker-images/' + dotValues.id + '.png', tmpFile);
        fs.unlinkSync(tmpFilePath);

        console.log('image updated');
    }

    // save in db
    dotValues.image = 'marker-images/' + dotValues.id + '.png';

    Dot.findOneAndUpdate({id: dotValues.id}, dotValues, function (err) {
        if (err) throw err;
        res.end(JSON.stringify(dotValues));
    });

    console.log("Dot updated on server");

    req.on("data", function (data) {
    });
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
            if (err) throw err;
            utils.deleteFolderRecursive(galleryPath, function (err) {
                if (err) throw err;
                console.log('dot gallery deleted');
            });
        });

        fs.stat(markerPath, function (err, status) {
            if (err) throw err;
            fs.unlink(markerPath, function (err) {
                if (err) throw err;
                console.log('dot marker image deleted');
            });
        });
    });

    console.log("Dot removed from server");
};