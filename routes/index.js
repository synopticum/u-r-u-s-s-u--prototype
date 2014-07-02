var multipart = require('connect-multiparty');
var fs = require('fs');
var multipartMiddleware = multipart( { uploadDir: 'public/tmp' });

var utils = require('../libs/util.js');
var Dot = require('../models/dot').Dot;

module.exports = function (app) {
    app.get('/', index);
    app.get('/admin', admin);
    app.get('/dots', sendDots);


    app.post('/dot', multipartMiddleware, addDot);
    app.put('/dot', multipartMiddleware, editDot);
    app.delete('/dot', removeDot);
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

    // create image
    if (!utils.isEmpty(req.files)) {
        var tmpFilePath = req.files.file_0.ws.path;
        var tmpFile = fs.readFileSync(tmpFilePath);

        fs.writeFileSync('public/marker-images/' + dotValues.id + '.png', tmpFile);
        fs.unlinkSync(tmpFilePath);
    }

    // save in db
    var dotValid = new Dot(dotValues);
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