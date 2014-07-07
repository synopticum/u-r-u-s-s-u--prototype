// init
$.getJSON("/dots", function (data) {
    BDots = new BDotsModel(data);
    View.map.init();
});

$.getJSON("/messages", function (data) {
    BMessages = new BMessagesModel(data);
});

// socket
var socket = io('http://localhost');
socket.on('dotChanges', function (data) {
    console.log(data);
    //socket.emit('my other event', { my: 'data' });
});