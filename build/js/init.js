// init
$.getJSON("/all", function (data) {
    BDots      = new BDotsModel(data.dots);
    BMessages  = new BMessagesModel(data.messages);
    BNews      = new BNewsModel(data.news);
    BAds       = new BAdsModel(data.ads);
    BAnonymous = new BAnonymousModel(data.anonymous);
    BLead      = new BLeadModel(data.lead);
    BClaims    = new BClaimsModel(data.claims);

    View.Map.init();
});

// socket
var socket = io('http://localhost');
socket.on('dotChanges', function (data) {
    console.log(data);
    //socket.emit('my other event', { my: 'data' });
});