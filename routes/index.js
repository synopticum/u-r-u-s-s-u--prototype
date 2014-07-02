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
    dotValues.gallery = [];

    // create image
    if (!utils.isEmpty(req.files)) {
        // add image
        if (req.files.file_0) {
            var tmpFilePath = req.files.file_0.ws.path;
            fs.readFile(tmpFilePath, function (err, result) {
                fs.writeFile('public/marker-images/' + dotValues.id + '.png', result, function (err) {
                    if (err) throw err;
                });
            });

            fs.unlink(tmpFilePath, function (err) {
                if (err) throw err;
                conlole.log('deleted!');
            });
        }

        // add gallery
        fs.mkdir('public/galleries/' + dotValues.id, 0755, function (err, result) {
            if (err) throw err;
        });

        for (var galleryImage in req.files) {
            var tmpFilePath = req.files[galleryImage].ws.path;

            fs.readFile(tmpFilePath, function (err, result) {
                fs.writeFile('public/galleries/' + dotValues.id + '/' + (Math.random()*31337 | 0) +'.jpg', result, function (err) {
                    if (err) throw err;
                });
            });
            dotValues.gallery.push('hui');

            fs.unlink(tmpFilePath, function (err) {
                if (err) throw err;
                console.log('deleted!');
            });
        }
    }

    // save in db
    var dotValid = new Dot(dotValues);
    console.log(dotValues.gallery);
    dotValid.image = 'marker-images/' + dotValues.id + '.png';

    dotValid.save(function (err, dot, affected) {
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
        dotId = data.toString();

        Dot.remove({ id: dotId }, function (err) {
            if (err) throw err;
            res.end("Dot removed from server");
        });
    });

    console.log("Dot removed from server");
};