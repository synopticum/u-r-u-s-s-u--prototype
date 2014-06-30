var Dot = require('../models/dot').Dot;

module.exports = function (app) {
    app.get('/', index);
    app.get('/admin', admin);
    app.get('/dots', sendDots);

    app.put('/dot/*', addDot);
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
    console.log(req.url);

    req.on("data", function (data) {
        var dot = new Dot(JSON.parse(data));

        dot.save(function (err, dot, affected) {
            console.log(arguments);
            if (err) throw err;
        });
    });

    console.log("Dot added on server");
    res.end("Dot added on server");
};

var destroyDot = function (req, res) {
    var dotId = req.route.params[0];

    Dot.remove({ id: dotId }, function (err) {
        if (err) throw err;
    });

    console.log("Dot removed from server");
    res.end("Dot removed from server");
};