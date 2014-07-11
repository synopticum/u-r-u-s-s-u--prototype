var multipart = require('connect-multiparty'),
    mmw = multipart({ uploadDir: 'public/tmp' }),
    passport = require('passport');

// modules
var auth      = require('../modules/auth'),
    send      = require('../modules/send'),
    dot       = require('../modules/dot'),
    upload    = require('../modules/upload'),
    messages  = require('../modules/messages'),
    news      = require('../modules/news'),
    ads       = require('../modules/ads'),
    anonymous = require('../modules/anonymous'),
    lead      = require('../modules/lead'),
    claims    = require('../modules/claims');

module.exports = function (app) {
    app.all('/all', mmw, send.all);

    app.post('/uploads', mmw, upload.singleImage);
    app.post('/uploadmarker', mmw, upload.markerImage);
    app.post('/uploadgallery', mmw, upload.galleryImages);

    app.get('/dots', dot.send);
    app.post('/dot', mmw, dot.add);
    app.put('/dot', mmw, dot.edit);
    app.delete('/dot', mmw, dot.remove);

    app.get('/messages', mmw, messages.get);
    app.post('/messages', mmw, messages.add);
    app.put('/messages', mmw, messages.edit);
    app.delete('/messages', mmw, messages.remove);

    app.get('/news', mmw, news.get);
    app.post('/news', mmw, news.add);
    app.put('/news', mmw, news.edit);
    app.delete('/news', mmw, news.remove);

    app.get('/ads', mmw, ads.get);
    app.post('/ads', mmw, ads.add);
    app.put('/ads', mmw, ads.edit);
    app.delete('/ads', mmw, ads.remove);

    app.get('/anonymous', mmw, anonymous.get);
    app.post('/anonymous', mmw, anonymous.add);
    app.put('/anonymous', mmw, anonymous.edit);
    app.delete('/anonymous', mmw, anonymous.remove);

    app.get('/lead', mmw, lead.get);
    app.post('/lead', mmw, lead.add);
    app.put('/lead', mmw, lead.edit);
    app.delete('/lead', mmw, lead.remove);

    app.get('/claims', mmw, claims.get);
    app.post('/claims', mmw, claims.add);
    app.put('/claims', mmw, claims.edit);
    app.delete('/claims', mmw, claims.remove);

    app.get('/', auth.logged);
    app.get('/join', auth.join);

    app.get('/auth', passport.authenticate('vkontakte'), function (req, res) {});

    app.get('/auth/callback',
        passport.authenticate('vkontakte', { failureRedirect: '/site-error' }),
        function (req, res) {
            res.redirect('/');
        });

    app.get('/logout', auth.logout);
};