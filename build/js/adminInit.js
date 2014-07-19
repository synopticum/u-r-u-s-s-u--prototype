View.Map = {
    init: function () {
        var mapMinZoom = 4;
        var mapMaxZoom = 5;

        var mainLayer = L.layerGroup(BDots.layers.main);
        var oldLayer = L.layerGroup(BDots.layers.old);
        var placesLayer = L.layerGroup(BDots.layers.user);
        var eventsLayer = L.layerGroup(BDots.layers.events);

        var userApprovedLayer = L.layerGroup(BDots.layers.usermain);
        var userPlacesLayer = L.layerGroup(BDots.layers.userplaces);
        var userEventsLayer = L.layerGroup(BDots.layers.userevents);

        var layersArray = [
            mainLayer,            // main layer
            oldLayer,             // old photos
            placesLayer,          // user dot approved
            eventsLayer,          // user event approved
            userApprovedLayer,    // user dot for mainLayer, don't approved
            userPlacesLayer,      // user dot for userLayer, don't approved
            userEventsLayer       // user dot for eventsLayer, don't approved
        ];

        var staticLayers = {
            "Общая карта": mainLayer
        };

        var dynamicLayers = {
            "Старые виды": oldLayer,
            "Места": placesLayer,
            "События": eventsLayer,
            "User: Общая карта": userApprovedLayer,
            "User: Места": userPlacesLayer,
            "User: События": userEventsLayer
        };

        map = L.map('map', { layers: layersArray });

        // map default view & draggable area
        map.setView([70, 10], 5);
        map.setMaxBounds([
            [5, -180],
            [122, 100]
        ]);

        // map size
        var mapBounds = new L.LatLngBounds(
            map.unproject([0, 4000], mapMaxZoom),
            map.unproject([6400, 0], mapMaxZoom)
        );

        // add markers to map
        L.tileLayer('tiles/{z}/{x}/{y}.png', {
            minZoom: mapMinZoom,
            maxZoom: mapMaxZoom,
            bounds: mapBounds,
            noWrap: true
        }).addTo(map);

        // add layers control (top right page corner)
        L.control.layers(staticLayers, dynamicLayers).addTo(map);

        map.on('load', (function () {
            $('#clouds').fadeOut(2000);
            View.Map.showStartScreen();
        })());

        // admin controls
        $('#messagesmod').on('click', function () {
            var view = new View.MessagesMod();
            $.fancybox.open(view.render());
        });

        $('#usersmod').on('click', function () {
            var view = new View.UsersMod();
            $.fancybox.open(view.render());
        });

        $('#panel').on('click', function () {
            var view = new View.StartScreen();
            $.fancybox.open(view.render());
        });

        // set dot
        map.on('dblclick', function (position) {
            var view = new View.AddDot();
            $.fancybox.open(view.render(position));
            $(".selectbox").selectbox();
            $(".markerset").buttonset();
        });

        // edit dot
        map.on('popupopen', function () {
            var popupId = $(this._popup._wrapper).find('.dot-container').attr('id');

            $(this._popup._wrapper).find('.dot-edit').click(function () {
                var view = new View.EditDot({ dotId: popupId });
                $.fancybox.open(view.render());
                $(".selectbox").selectbox();
                $(".markerset").buttonset();
            });

            $(this._popup._wrapper).find('.dot-destroy').click(function () {
                var view = new View.RemoveDot({ dotId: popupId });
                $.fancybox.open(view.render());
            });

            $(this._popup._wrapper).find('.dot-play').click(function () {
                $(this).toggleClass('active');
                var audio = document.getElementById('dot-track');

                if ($(this).attr('data-audio') === 'playing') {
                    $(this).attr('data-audio', 'paused');
                    audio.pause();
                }
                else {
                    $(this).attr('data-audio', 'playing');
                    audio.play();
                }
            });

            $(this._popup._wrapper).find('.dot-messages').click(function () {
                var view = new View.MessagesDot({ dotId: popupId });
                $.fancybox.open(view.render());
            });

            $('.fancybox').fancybox();
        });
    },
    showStartScreen: function () {
        // show start view
        var view = new View.StartScreen();
        $.fancybox.open(view.render());
    }
};

View.EditDot = Backbone.View.extend({
    dot: null,
    dotId: null,
    initialize: function (obj) {
        this.dotId = obj.dotId;
        this.dot = BDots.records.get(this.dotId).attributes;
    },
    id: 'editdot-popup',
    className: 'popup',
    template: _.template($('#editdot-popup-template').html()),
    render: function () {
        return this.$el.html(this.template(this.dot));
    },
    events: {
        'click .input-submit': 'submit',
        'click .input-marker': 'select-marker-open',
        'click #selectMarkerPopup input': 'select-marker-close',
        'change .input-file': 'file'
    },
    'select-marker-open': function (e) {
        $('#selectMarkerPopup').fadeIn('fast');
        e.preventDefault();
    },
    'select-marker-close': function () {
        $('#selectMarkerPopup').fadeOut('fast');
    },
    'submit': function () {
        var _this = $(this.$el);

        _this.marker = this.dot.marker;
        _this.id = this.dotId;
        _this.position = this.dot.position;
        _this.layer = $(".input-layer", _this).val();
        _this.title = $(".input-title", _this).val();
        _this.text = $(".input-short-text", _this).val();
        _this.image = this.image;
        _this.icon = $("input[name='markerset']:checked", _this).val();
        _this.address = $(".input-address", _this).val();
        _this.street = $(".input-street", _this).val();
        _this.house = $(".input-house", _this).val();
        _this.homePhone = $(".input-home-phone", _this).val();
        _this.track = $(".input-track", _this).val();
        _this.gallery = this.dot.gallery;

        var dot = new BDot({
            id: _this.id,
            template: null,
            byUser: null,
            layer: _this.layer,
            position: _this.position,
            title: _this.title,
            text: _this.text,
            image: _this.image,
            icon: _this.icon,
            address: _this.address,
            street: _this.street,
            house: _this.house,
            homePhone: _this.homePhone,
            track: _this.track,
            gallery: _this.gallery
        });

        if (BDots.records) {
            // create FormData Object with files/json
            var fd = new FormData();

            var gallery_data = $('.input-gallery')[0].files;
            for (var j = 0; j < gallery_data.length; j++) {
                fd.append("gallery_" + j, gallery_data[j]);
            }

            var other_data = JSON.stringify(dot);

            fd.append('json', other_data);

            dot.sync('put', fd, {
                success: function (model) {
                    var response = JSON.parse(model);

                    delete response.__v;
                    delete response._id;

                    var record = BDots.records.get(response.id);
                    record.set(response);

                    map.removeLayer(_this.marker);

                    var view = new View.ShowDot(response.attributes);
                    L.marker(response.position, { icon: record.getIcon() }).bindPopup(view.template(response)).addTo(map);

                    console.log('Dot updated on server');
                },
                error: function (model, response) {
                    console.log('Dot creation server error!');
                    console.log(response.responseText);
                }
            });
        }
        else throw Error('BDots.records don t exist');

        $.fancybox.close(_this);
        helper.status('Точка изменена');
    },
    'file': helper.markerImageUpload
});

View.RemoveDot = Backbone.View.extend({
    dot: null,
    dotId: null,
    initialize: function (obj) {
        this.dotId = obj.dotId;
        this.dot = BDots.records.get(this.dotId).attributes;
    },
    id: 'destroydot-popup',
    className: 'popup',
    template: _.template($('#destroydot-popup-template').html()),
    render: function () {
        return this.$el.html(this.template(this.dot));
    },
    events: {
        'click .input-submit': 'submit'
    },
    'submit': function () {
        var _this = $(this.$el);

        if (BDots.records) {
            var record = BDots.records.get(this.dotId);
            var galleryFiles = record.get('gallery');

            var fd = new FormData();
            fd.append('id', this.dotId);
            fd.append('galleryFiles', galleryFiles);

            record.destroy(fd, {
                success: function (model, response) {
                    console.log(response);
                    BDots.records.remove(record);
                },
                error: function (model, response) {
                    console.log('dot remove server error!');
                    console.log(response.responseText);
                }
            });

            map.removeLayer(this.dot.marker);
        }
        else throw Error('BDots.records don t exist');

        $.fancybox.close(_this);
        helper.status('Точка удалена');
    }
});

View.MessagesMod = Backbone.View.extend({
    messages: {},
    initialize: function () {
        var messages = JSON.stringify(BMessages.records.where({ approved: false }));
        this.messages = JSON.parse(messages);
    },
    id: 'messagesdot-popup',
    className: 'popup',
    template: _.template($('#messagesmod-popup-template').html()),
    render: function () {
        return this.$el.html(this.template(this));
    },
    events: {
        'click .input-submit': 'submit',
        'click .messagesmod-update': 'update'
    },
    'submit': function () {
        var _this = $(this.$el);

        $.fancybox.close(_this);
        helper.status('Сообщение отправлено');
    },
    'update': function () {
        BMessages.records.fetch({ url : "/messages", success: function () { helper.status('Updated') }, error: function () { helper.status('Error') } });
    }
});

View.UsersMod = Backbone.View.extend({
    users: {},
    initialize: function () {
        var users = JSON.stringify(BUsers.records);
        this.users = JSON.parse(users);
    },
    id: 'usersmod-popup',
    className: 'popup',
    template: _.template($('#usersmod-popup-template').html()),
    render: function () {
        return this.$el.html(this.template(this));
    },
    events: {
        'click .input-submit': 'submit',
        'click .messagesmod-update': 'update'
    },
    'submit': function () {
        var _this = $(this.$el);

        $.fancybox.close(_this);
        helper.status('Сообщение отправлено');
    },
    'update': function () {
        BUsers.records.fetch({ url : "/users", success: function () { helper.status('Updated') }, error: function () { helper.status('Error') } });
    }
});

View.MessagesDot = Backbone.View.extend({
    dot: null,
    dotId: null,
    initialize: function (obj) {
        this.dotId = obj.dotId;
        this.dot = BDots.records.get(this.dotId).attributes;

        // dot messages search
        var messagesFound = BMessages.records.where({ dotId: this.dotId });
        messagesFound = JSON.stringify(messagesFound);
        this.dot.messages = JSON.parse(messagesFound);
    },
    id: 'messagesdot-popup',
    className: 'popup',
    template: _.template($('#messagesdot-popup-template').html()),
    render: function () {
        return this.$el.html(this.template(this.dot));
    },
    events: {
        'click .input-submit': 'submit',
        'change .input-file': 'file'
    },
    'submit': function () {
        var _this = $(this.$el);
        var message = {
            id: this.dotId,
            text: $('.popup-textarea', _this).val(),
            image: this.image
        };

        $.post('/messages', message, { success: function () {
            console.log('message added')
        }, error: function (res) {
            console.log(res)
        } });

        $.fancybox.close(_this);

        helper.playSend();
        helper.status('Сообщение отправлено');
    },
    'file': helper.singleImageUpload
});

View.NewsScreen = Backbone.View.extend({
    messages: {},
    user: {},
    initialize: function () {
        var newsFound = BNews.records;
        newsFound = JSON.stringify(newsFound);
        this.messages = JSON.parse(newsFound);

        this.user.name = BYou.get('name');
        this.user.avatar = BYou.get('avatar');
        this.user.status = BYou.get('status');
    },
    id: 'news-screen',
    template: _.template($('#news-template').html()),
    render: function () {
        return this.$el.html(this.template(this));
    },
    events: {
        'click .input-submit': 'submit',
        'change .input-file': 'file',
        'click #update': 'update'
    },
    'submit': function () {
        var _this = $(this.$el);
        var newsItem = {
            id: this.dotId,
            text: $('.popup-textarea', _this).val(),
            image: this.image
        };

        $.post('/news', newsItem, { success: function () {
            console.log('news item added')
        }, error: function (res) {
            console.log(res)
        } });


        helper.disableInputs();
        helper.playSend();
        helper.status('Сообщение отправлено');
    },
    'file': helper.singleImageUpload,
    'update': function () {
        BNews.records.fetch({ url : "/news", success: function () {
            var view = new View.NewsScreen();
            $('.tabs-wrapper').html(view.render());

            $('.fancybox-skin, .tabs').css('border-color', '#6B9B2A');
            $('.tabs li').removeClass('active');
            $('#tab-news').addClass('active');

            $('.dot-messages-image a').click(helper.singleImage);
        }});
    }
});

View.AdsScreen = Backbone.View.extend({
    messages: {},
    user: {},
    initialize: function () {
        var adsFound = BAds.records;
        adsFound = JSON.stringify(adsFound);
        this.messages = JSON.parse(adsFound);

        this.user.name = BYou.get('name');
        this.user.avatar = BYou.get('avatar');
        this.user.status = BYou.get('status');
    },
    id: 'ads-screen',
    template: _.template($('#ads-template').html()),
    render: function () {
        return this.$el.html(this.template(this));
    },
    events: {
        'click .input-submit': 'submit',
        'change .input-file': 'file',
        'click #update': 'update'
    },
    'submit': function () {
        var _this = $(this.$el);

        var adsItem = {
            id: this.dotId,
            text: $('.popup-textarea', _this).val(),
            image: this.image,
            phone: $('.input-ads-phone', _this).val()
        };

        console.log('all ok');
        $.post('/ads', adsItem, { success: function () {
            console.log('news item added')
        }, error: function (res) {
            console.log(res)
        } });


        helper.disableInputs();
        helper.playSend();
        helper.status('Сообщение отправлено');
    },
    'file': helper.singleImageUpload,
    'update': function () {
        BAds.records.fetch({ url : "/ads", success: function () {
            var view = new View.AdsScreen();
            $('.tabs-wrapper').html(view.render());

            $('.fancybox-skin, .tabs').css('border-color', '#6B9B2A');
            $('.tabs li').removeClass('active');
            $('#tab-ads').addClass('active');

            $('.dot-messages-image a').click(helper.singleImage);
            $(".input-ads-phone").inputmask("+7 (999) 999-99-99");
        }});
    }
});

View.AnonymousScreen = Backbone.View.extend({
    messages: {},
    random: helper.anonymousRandom(),
    initialize: function () {
        var anonymousFound = BAnonymous.records;
        anonymousFound = JSON.stringify(anonymousFound);
        this.messages = JSON.parse(anonymousFound);
    },
    id: 'anonymous-screen',
    template: _.template($('#anonymous-template').html()),
    render: function () {
        return this.$el.html(this.template(this));
    },
    events: {
        'click .input-submit': 'submit',
        'change .input-file': 'file',
        'click #update': 'update'
    },
    'submit': function () {
        var _this = $(this.$el);
        var anonymousItem = {
            id: this.dotId,
            text: $('.popup-textarea', _this).val(),
            image: this.image
        };

        $.post('/anonymous', anonymousItem, { success: function () {
            console.log('news item added')
        }, error: function (res) {
            console.log(res)
        } });


        helper.disableInputs();
        helper.playSend();
        helper.status('Сообщение отправлено');
    },
    'file': helper.singleImageUpload,
    'update': function () {
        BAnonymous.records.fetch({ url : "/anonymous", success: function () {
            var view = new View.AnonymousScreen();
            $('.tabs-wrapper').html(view.render());

            $('.fancybox-skin, .tabs').css('border-color', '#6B9B2A');
            $('.tabs li').removeClass('active');
            $('#tab-anonymous').addClass('active');

            $('.dot-messages-image a').click(helper.singleImage);
        }});
    }
});

View.LeadScreen = Backbone.View.extend({
    messages: {},
    user: {},
    random: helper.leadRandom(),
    initialize: function () {
        var leadFound = BLead.records;
        leadFound = JSON.stringify(leadFound);
        this.messages = JSON.parse(leadFound);

        this.user.name = BYou.get('name');
        this.user.avatar = BYou.get('avatar');
        this.user.status = BYou.get('status');
    },
    id: 'lead-screen',
    template: _.template($('#lead-template').html()),
    render: function () {
        return this.$el.html(this.template(this));
    },
    events: {
        'click .input-submit': 'submit',
        'change .input-file': 'file',
        'click #update': 'update'
    },
    'submit': function () {
        var _this = $(this.$el);

        var leadItem = {
            id: this.dotId,
            text: $('.popup-textarea', _this).val(),
            image: this.image
        };

        console.log('all ok');
        $.post('/lead', leadItem, { success: function () {
            console.log('news item added')
        }, error: function (res) {
            console.log(res)
        } });


        helper.disableInputs();
        helper.playSend();
        helper.status('Сообщение отправлено');
    },
    'file': helper.singleImageUpload,
    'update': function () {
        BLead.records.fetch({ url : "/lead", success: function () {
            var view = new View.LeadScreen();
            $('.tabs-wrapper').html(view.render());

            $('.fancybox-skin, .tabs').css('border-color', '#6B9B2A');
            $('.tabs li').removeClass('active');
            $('#tab-lead').addClass('active');

            $('.dot-messages-image a').click(helper.singleImage);
        }});
    }
});

View.ClaimsScreen = Backbone.View.extend({
    messages: {},
    user: {},
    initialize: function () {
        var claimsFound = BClaims.records;
        claimsFound = JSON.stringify(claimsFound);
        this.messages = JSON.parse(claimsFound);

        this.user.name = BYou.get('name');
        this.user.avatar = BYou.get('avatar');
        this.user.status = BYou.get('status');
    },
    id: 'claims-screen',
    template: _.template($('#claims-template').html()),
    render: function () {
        return this.$el.html(this.template(this));
    },
    events: {
        'click .input-submit': 'submit',
        'change .input-file': 'file',
        'click #update': 'update'
    },
    'submit': function () {
        var _this = $(this.$el);

        var claimsItem = {
            id: this.dotId,
            text: $('.popup-textarea', _this).val(),
            image: this.image
        };

        console.log('all ok');
        $.post('/claims', claimsItem, { success: function () {
            console.log('news item added')
        }, error: function (res) {
            console.log(res)
        } });


        helper.disableInputs();
        helper.playSend();
        helper.status('Жалоба отправлена');
    },
    'file': helper.singleImageUpload,
    'update': function () {
        BClaims.records.fetch({ url : "/claims", success: function () {
            var view = new View.ClaimsScreen();
            $('.tabs-wrapper').html(view.render());

            $('.fancybox-skin, .tabs').css('border-color', '#6B9B2A');
            $('.tabs li').removeClass('active');
            $('#tab-claims').addClass('active');

            $('.dot-messages-image a').click(helper.singleImage);
        }});
    }
});

$.getJSON("/all", function (data) {
    BYou       = new BYouModel(data.user);
    BDots      = new BDotsModel(data.dots);
    BMessages  = new BMessagesModel(data.messages);
    BNews      = new BNewsModel(data.news);
    BAds       = new BAdsModel(data.ads);
    BAnonymous = new BAnonymousModel(data.anonymous);
    BLead      = new BLeadModel(data.lead);
    BClaims    = new BClaimsModel(data.claims);

    View.Map.init();
});

$.getJSON("/users", function (data) {
    BUsers = new BUsersModel(data);
});