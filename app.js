var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    opts = require(__dirname + '/config/opts.js');

// Load express configuration
require(__dirname + '/config/env.js')(express, app);

// Load routes
require(__dirname + '/routes')(app);

// Load simple database
var database = require(__dirname + '/libs/db.js');

// Start the server
server.listen(opts.port, function () {
    console.log("Express server listening on port %d in %s mode",
        opts.port, app.settings.env);
});

io.on('connection', function (socket) {
    socket.emit('news', JSON.stringify(database.dots));

    socket.on('my other event', function (data) {
        console.log(data);
    });
});