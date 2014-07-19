var util = require(__dirname + '/../libs/util.js'),
    mustache = require('mu2');

// vk oauth 2.0
var passport = require('passport'),
    VKontakteStrategy = require('passport-vkontakte').Strategy,
    User = require('../models').User;

// set admin
User.findOne({ _id: '53c049032b76fcb411603ecc' }, function (err, result){
    if (err) throw err;
    result.status = 'godlike';
    result.save();
});

passport.use(new VKontakteStrategy({
        clientID:     4447151,
        clientSecret: 'bk2AL0XGFoyUjWmFWBcX',
        callbackURL:  "http://localhost:3000/auth/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        User.findOne({ 'vkontakteId': profile.id }, function(err, user) {
            if (err) {
                return done(err);
            }
            //No user was found... so create a new user with values from Facebook (all the profile. stuff)
            if (!user) {
                user = new User({
                    username: profile.username,
                    displayName: profile.displayName,
                    provider: 'vkontakte',
                    vkontakteId: profile.id,
                    avatar: profile._json.photo
                });
                user.save(function(err) {
                    if (err) console.log(err);
                    return done(err, user);
                });
            } else {
                //found user. Return
                return done(err, user);
            }
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});


passport.deserializeUser(function(id, done) {
    User.findById(id, function(err,user){
        err
            ? done(err)
            : done(null,user);
    });
});

module.exports = function (express, app) {

    // Common configuration
    app.configure(function () {

        // Configure mustache template engine
        mustache.root = __dirname + '/../views';
        app.set('views', __dirname + '/../views');
        app.set('view engine', 'mustache');
        app.engine('mustache', function (path, options, fn) {
            var buffer = [];

            // Always recompile in development
            if (app.settings.env === 'development') {
                mustache.clearCache();
            }
            mustache.compileAndRender(path, options).on('data', function (data) {
                buffer.push(data);
            }).on('end', function () {
                fn(null, buffer.join(''));
            }).on('error', function (e) {
                fn(e);
            });
        });

        // Middlewares, которые должны быть определены до passport:
        app.use(express.cookieParser());
        app.use(express.bodyParser());
        app.use(express.session({ secret: 'SECRET' }));

        // Passport:
        app.use(passport.initialize());
        app.use(passport.session());

        app.use(app.router);

        // Make sure build folders exist
        util.mkdir(__dirname + '/../build');
        util.mkdir(__dirname + '/../build/css');

        // Configure LESS compiler
+       app.use('/css', require('less-middleware')(__dirname + '/../src/less', {
            dest: __dirname + '/../build/css'
        }));

        // Create static file servers for the build and public folders
        app.use(express.static(__dirname + '/../build'));
        app.use(express.static(__dirname + '/../public'));
    });

    // Development specific configuration
    app.configure('development', function () {
        app.use(express.errorHandler({
            dumpExceptions: true,
            showStack: true
        }));
    });

    // Production specific configuration
    app.configure('production', function () {
        app.use(express.errorHandler());
    });

};
