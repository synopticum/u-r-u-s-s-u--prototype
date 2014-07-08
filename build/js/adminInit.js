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

        map.on('load', $('#clouds').fadeOut(2000));
        map.on('load', View.Map.showStartScreen());

        // admin controls
        $('#messagesmod').on('click', function () {
            var view = new View.MessagesMod();
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

            $(this._popup._wrapper).find('.dot-messages').click(function () {
                var view = new View.MessagesDot({ dotId: popupId });
                $.fancybox.open(view.render());
            });

            $('.fancybox').fancybox();
        });
    },
    showStartScreen : function () {
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
    render: function() {
        return this.$el.html(this.template(this.dot));
    },
    events: {
        'click .input-submit': 'submit',
        'click .input-marker': 'select-marker-open',
        'click #selectMarkerPopup input': 'select-marker-close'
    },
    'select-marker-open': function (e) {
        $('#selectMarkerPopup').fadeIn('fast');
        e.preventDefault();
    },
    'select-marker-close': function () {
        $('#selectMarkerPopup').fadeOut('fast');
    },
    'submit': function() {
        var _this = $(this.$el);

        _this.marker      = this.dot.marker;
        _this.id          = this.dotId;
        _this.position    = this.dot.position;
        _this.layer       = $(".input-layer", _this).val();
        _this.title       = $(".input-title", _this).val();
        _this.text        = $(".input-short-text", _this).val();
        _this.image       = $(".input-image", _this).val();
        _this.icon        = $("input[name='markerset']:checked", _this).val();
        _this.address     = $(".input-address", _this).val();
        _this.street      = $(".input-street", _this).val();
        _this.house       = $(".input-house", _this).val();
        _this.homePhone   = $(".input-home-phone", _this).val();
        _this.mobilePhone = $(".input-mobile-phone", _this).val();
        _this.gallery     = this.dot.gallery;

        var dot = new BDot({
            id          : _this.id,
            template    : null,
            byUser      : null,
            layer       : _this.layer,
            position    : _this.position,
            title       : _this.title || "-",
            text        : _this.text || "-",
            image       : _this.image,
            icon        : _this.icon,
            address     : _this.address || "-",
            street      : _this.street || "-",
            house       : _this.house || "-",
            homePhone   : _this.homePhone || "-",
            mobilePhone : _this.mobilePhone || "-",
            gallery     : _this.gallery
        });

        if (BDots.records) {

            // create FormData Object with files/json
            var fd = new FormData();

            var file_data = $('.input-image')[0].files;
            for(var i = 0; i < file_data.length; i++){
                fd.append("markerimage", file_data[i]);
            }

            var gallery_data = $('.input-gallery')[0].files;
            for(var j = 0; j < gallery_data.length; j++){
                fd.append("gallery_" + j, gallery_data[j]);
            }

            var other_data = JSON.stringify(dot);

            fd.append('json', other_data);

            dot.sync('put', fd, {
                success: function(model){
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
                error: function(model, response){
                    console.log('Dot creation server error!');
                    console.log(response.responseText);
                }
            });
        }
        else throw Error('BDots.records don t exist');

        $.fancybox.close(_this);
        helper.status('Точка изменена');
    }
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
    render: function() {
        return this.$el.html(this.template(this.dot));
    },
    events: {
        'click .input-submit': 'submit'
    },
    'submit': function() {
        var _this = $(this.$el);

        if (BDots.records) {
            var record = BDots.records.get(this.dotId);

            record.destroy(this.dotId, {
                success: function(model, response){
                    console.log(response);
                    BDots.records.remove(record);
                },
                error: function(model, response){
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
        var messages = JSON.stringify(BMessages.records.where({ approved : false }));
        this.messages = JSON.parse(messages);
    },
    id: 'messagesdot-popup',
    className: 'popup',
    template: _.template($('#messagesmod-popup-template').html()),
    render: function() {
        return this.$el.html(this.template(this));
    },
    events: {
        'click .input-submit': 'submit'
    },
    'submit': function() {
        var _this = $(this.$el);

        $.fancybox.close(_this);
        helper.status('Сообщение отправлено');
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
    render: function() {
        return this.$el.html(this.template(this.dot));
    },
    events: {
        'click .input-submit': 'submit',
        'keyup .popup-textarea': 'change'
    },
    'submit': function() {
        var _this = $(this.$el);
        var message = {
            id: this.dotId,
            text: $('.popup-textarea' ,_this).val()
        };

        // check length
        var messageText = $('.popup-textarea' ,_this).val();

        if (messageText.length >= 999)
            return;
        else {
            $.post('/messages', message, { success: function () {
                console.log('message added')
            }, error: function (res) {
                console.log(res)
            } });
        }

        $.fancybox.close(_this);
        helper.status('Сообщение отправлено');
    },
    'change': function () {
        var _this = $(this.$el);
        var messageText = $('.popup-textarea' ,_this).val();

        if (messageText.length > 999) {
            $('.popup-textarea' ,_this).addClass('req');
        }
        else if (messageText.length <= 999) {
            $('.popup-textarea' ,_this).removeClass('req');
        }
    }
});

View.NewsScreen = Backbone.View.extend({
    messages : {},
    initialize: function () {
        var newsFound = BNews.records;
        newsFound = JSON.stringify(newsFound);
        this.messages = JSON.parse(newsFound);
    },
    id: 'news-screen',
    template: _.template($('#news-template').html()),
    render: function() {
        return this.$el.html(this.template(this));
    },
    events: {
        'click .input-submit': 'submit',
        'keyup .popup-textarea': 'change'
    },
    'submit': function() {
        var _this = $(this.$el);
        var newsItem = {
            id: this.dotId,
            text: $('.popup-textarea' ,_this).val()
        };

        // check length
        var messageText = $('.popup-textarea' ,_this).val();

        if (messageText.length >= 999)
            return false;
        else {
            $.post('/news', newsItem, { success: function () {
                console.log('news item added')
            }, error: function (res) {
                console.log(res)
            } });

            $('.popup-textarea', _this).attr('disabled', 'disabled').val('');
            $('.input-submit', _this).attr('disabled', 'disabled').addClass('popup-button-disabled');
        }
    },
    'change': function () {
        var _this = $(this.$el);
        var messageText = $('.popup-textarea' ,_this).val();

        if (messageText.length > 999) {
            $('.popup-textarea' ,_this).addClass('req');
        }
        else if (messageText.length <= 999) {
            $('.popup-textarea' ,_this).removeClass('req');
        }
    }
});

View.AdsScreen = Backbone.View.extend({
    messages : {},
    initialize: function () {
        var adsFound = BAds.records;
        adsFound = JSON.stringify(adsFound);
        this.messages = JSON.parse(adsFound);
    },
    id: 'ads-screen',
    template: _.template($('#ads-template').html()),
    render: function() {
        return this.$el.html(this.template(this));
    },
    events: {
        'click .input-submit': 'submit',
        'keyup .popup-textarea': 'change'
    },
    'submit': function() {
        var _this = $(this.$el);

        var adsItem = {
            id: this.dotId,
            text: $('.popup-textarea' ,_this).val()
        };

        // check length
        var messageText = $('.popup-textarea' ,_this).val();

        if (messageText.length >= 999)
            return false;
        else {
            console.log('all ok');
            $.post('/ads', adsItem, { success: function () {
                console.log('news item added')
            }, error: function (res) {
                console.log(res)
            } });

            $('.popup-textarea', _this).attr('disabled', 'disabled').val('');
            $('.input-submit', _this).attr('disabled', 'disabled').addClass('popup-button-disabled');
        }
    },
    'change': function () {
        var _this = $(this.$el);
        var messageText = $('.popup-textarea' ,_this).val();

        if (messageText.length > 999) {
            $('.popup-textarea' ,_this).addClass('req');
        }
        else if (messageText.length <= 999) {
            $('.popup-textarea' ,_this).removeClass('req');
        }
    }
});

View.AnonymousScreen = Backbone.View.extend({
    messages : {},
    randomWelcome : helper.anonymousRandom(),
    initialize: function () {
        var anonymousFound = BAnonymous.records;
        anonymousFound = JSON.stringify(anonymousFound);
        this.messages = JSON.parse(anonymousFound);
    },
    id: 'anonymous-screen',
    template: _.template($('#anonymous-template').html()),
    render: function() {
        return this.$el.html(this.template(this));
    },
    events: {
        'click .input-submit': 'submit',
        'keyup .popup-textarea': 'change'
    },
    'submit': function() {
        var _this = $(this.$el);
        var anonymousItem = {
            id: this.dotId,
            text: $('.popup-textarea' ,_this).val()
        };

        // check length
        var messageText = $('.popup-textarea' ,_this).val();

        if (messageText.length >= 999)
            return false;
        else {
            $.post('/anonymous', anonymousItem, { success: function () {
                console.log('news item added')
            }, error: function (res) {
                console.log(res)
            } });

            $('.popup-textarea', _this).attr('disabled', 'disabled').val('');
            $('.input-submit', _this).attr('disabled', 'disabled').addClass('popup-button-disabled');
        }
    },
    'change': function () {
        var _this = $(this.$el);
        var messageText = $('.popup-textarea' ,_this).val();

        if (messageText.length > 999) {
            $('.popup-textarea' ,_this).addClass('req');
        }
        else if (messageText.length <= 999) {
            $('.popup-textarea' ,_this).removeClass('req');
        }
    }
});

// get data
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