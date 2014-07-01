var utils = require('../libs/util.js');
var Dot = require('../models/dot').Dot;

module.exports = function (app) {
    app.get('/', index);
    app.get('/admin', admin);
    app.get('/dots', sendDots);

    app.post('/dot', addDot);
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
    req.on("data", function (data) {
        var dot = JSON.parse(data);
        dot.id = utils.guid();

        var dotValid = new Dot(dot);

        dotValid.save(function (err, dot, affected) {
            if (err) throw err;
            res.end(JSON.stringify(dot));
        });

        console.log("Dot added on server");
    });

};

var saveDot = function (req, res) {
    req.on("data", function (data) {
        var dotId = req.route.params[0];
        var dot = JSON.parse(data);

        Dot.update({id: dotId}, dot, function (err) {
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
    });

    console.log("Dot removed from server");
    res.end("Dot removed from server");
};