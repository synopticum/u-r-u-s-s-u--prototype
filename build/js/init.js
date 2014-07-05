// init
$.getJSON("/dots", function (data) {
    BDots = new BModel(data);
    View.map.init();
});

// socket
var socket = io('http://localhost');
socket.on('dotChanges', function (data) {
    console.log(data);
    //socket.emit('my other event', { my: 'data' });
});