var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    opts = require(__dirname + '/config/opts.js');

// Load express configuration
require(__dirname + '/config/env.js')(express, app);

// Load routes
require(__dirname + '/routes')(app);

// Start the server
server.listen(opts.port, function () {
    console.log("Express server listening on port %d in %s mode",
        opts.port, app.settings.env);
});

// socket
//io.on('connection', function (socket) {
//    socket.emit('dotChanges', { hello: 'world' });
//    socket.on('my other event', function (data) {
//        console.log(data);
//    });
//});