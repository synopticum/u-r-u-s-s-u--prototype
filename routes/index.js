var multipart = require('connect-multiparty');
var fs = require('fs');
var multipartMiddleware = multipart(
    {
        uploadDir: 'public/tmp'
    }
);

var utils = require('../libs/util.js');
var Dot = require('../models/dot').Dot;

module.exports = function (app) {
    app.get('/', index);
    app.get('/admin', admin);
    app.get('/dots', sendDots);

    app.post('/uploadimage', multipartMiddleware, function (req, res, next) {
//        for (var file in req.files) {
//            console.log(req.files[file]);
//        }
        console.log(req.files.markerimage);

        var tmpFilePath = req.files.markerimage.ws.path;
        var tmpFile = fs.readFileSync(tmpFilePath);

        fs.writeFileSync('public/marker-images/imagetest.png', tmpFile);
        fs.unlinkSync(tmpFilePath);

        res.end('File accepted by server');
    });
    app.post('/dot', multipartMiddleware, addDot);

    app.put('/dot/*', saveDot);
    app.delete('/dot/*', destroyDot);
};

var index = function (req, res) {
    res.render('index', { title: 'Node Boilerplate' });
};

var admin = function (req, res) {
    res.render('admin', { title: 'Node Admin' });
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

    console.log(dotValues);

    var dotValid = new Dot(dotValues);

    dotValid.save(function (err, dot, affected) {
        if (err) throw err;
        res.end(JSON.stringify(dot));
    });

    console.log("Dot added on server");

    req.on("data", function (data) {
    });
};

var saveDot = function (req, res) {
    req.on("data", function (data) {
        var dot = JSON.parse(data);

        delete dot.position;

        Dot.update({id: dot.id}, dot, function (err) {
            if (err) throw err;
            res.end(JSON.stringify(dot));
        });

        console.log("Dot updated on server");
    });

};

var destroyDot = function (req, res) {
    var dotId = req.route.params[0];

    Dot.remove({ id: dotId }, function (err) {
        if (err) throw err;
        res.end("Dot removed from server");
    });

    console.log("Dot removed from server");
};