// init
$.getJSON("/dots", function (data) {
    BDots = new BDotsModel(data);
    View.Map.init();
});

$.getJSON("/messages", function (data) {
    BMessages = new BMessagesModel(data);
});

$.getJSON("/news", function (data) {
    BNews = new BNewsModel(data);
});

$.getJSON("/ads", function (data) {
    BAds = new BAdsModel(data);
});

$.getJSON("/anonymous", function (data) {
    BAnonymous = new BAnonymousModel(data);
});

$.getJSON("/lead", function (data) {
    BLead = new BLeadModel(data);
});

$.getJSON("/claims", function (data) {
    BClaims = new BClaimsModel(data);
});

// socket
var socket = io('http://localhost');
socket.on('dotChanges', function (data) {
    console.log(data);
    //socket.emit('my other event', { my: 'data' });
});