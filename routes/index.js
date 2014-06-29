var database = require('../libs/db.js');

module.exports = function (app) {
    app.get('/', index);
    app.get('/admin', admin);
    app.get('/dots', sendDots);

    app.put('/dot', addDot);
    app.delete('/dot', destroyDot);
};

var index = function (req, res) {
    res.render('index', { title: 'Node Boilerplate' });
};

var admin = function (req, res) {
    res.render('admin', { title: 'Node Admin' });
};

var sendDots = function (req, res) {
    res.end(JSON.stringify(database.dots));
    console.log('dots sended');
};

var addDot = function (req, res) {
    req.on("data", function (data) {
        var z = JSON.parse(data);
        console.log(z);
    });
    console.log('added!');
    res.end("JSON accepted by server");
};

var destroyDot = function (req, res) {
    req.on("data", function (data) {
        var z = JSON.parse(data);
        console.log('Incoming record: ');
        console.log(z);
    });
    console.log('delete method!');
    res.end("JSON accepted by server");
};