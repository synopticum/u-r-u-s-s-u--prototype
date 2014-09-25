var domain = require('domain');
var serverDomain = domain.create();

serverDomain.on('error', function (err) {
    console.log('Server Domain: %s', err)
});

serverDomain.run(function () {
    var express = require('express'),
        app = express(),
        server = require('http').Server(app),
        io = require('socket.io')(server),
        opts = require(__dirname + '/config/opts');

    // Load express configuration
    require(__dirname + '/config/env')(express, app);

    // Load routes
    require(__dirname + '/routes')(app);

    // Start the server
    server.listen(opts.port, function () {
        console.log("Express server listening on port %d in %s mode", opts.port, app.settings.env);
    });
});

// olo