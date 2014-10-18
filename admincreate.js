// model
var User = require('./models').User;

// update
var adminrecord = new User({
    username: 'iamadmin',
    displayName: 'superadmin',
    vkontakteId: '666',
    avatar: 'http://site.com/img.bmp',
    created: Date.now(),
    status: 'godlike'
});

adminrecord.save(function(err) {
    if (err) throw err;
});