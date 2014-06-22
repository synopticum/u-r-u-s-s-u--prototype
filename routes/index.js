var database = require('../libs/db.js');

module.exports = function (app) {
    app.get('/', index);
    app.get('/admin', admin);
    app.post('/dot/add', addDot);
};

var index = function (req, res) {
    res.render('index', { title: 'Node Boilerplate' });
};

var admin = function (req, res) {
    res.render('admin', { title: 'Node Admin' });
};

var addDot = function (req, res) {
    req.on("data", function (data) {
        var obj = data.toString();
        obj = JSON.parse(obj);
        console.log(obj);
    });
    res.end("JSON accepted by server");
};