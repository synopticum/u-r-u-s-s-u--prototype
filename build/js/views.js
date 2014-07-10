var map;
var LeafIcon = L.Icon.extend({ options: { iconSize: [32, 32] } });

var View = {
    Map: {
        init: function () {
            var mapMinZoom = 4;
            var mapMaxZoom = 5;

            var mainLayer = L.layerGroup(BDots.layers.main);
            var oldLayer = L.layerGroup(BDots.layers.old);
            var placesLayer = L.layerGroup(BDots.layers.places);
            var eventsLayer = L.layerGroup(BDots.layers.events);

            var layersArray = [
                mainLayer,           // main layer
                oldLayer,            // old photos
                placesLayer,         // user dot approved
                eventsLayer          // user event approved
            ];

            var staticLayers = {
                "Общая карта": mainLayer
            };

            var dynamicLayers = {
                "Места": placesLayer,
                "События": eventsLayer,
                "Старые виды": oldLayer
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

            map.on('load', View.Map.hideLoadScreen);
            map.on('load', View.Map.showStartScreen());

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

                $(this._popup._wrapper).find('.dot-messages').click(function () {
                    var view = new View.MessagesDot({ dotId: popupId });
                    $.fancybox.open(view.render());
                });

                $('.fancybox').fancybox();
            });
        },
        hideLoadScreen: $('#clouds').fadeOut(2000),
        showStartScreen: function () {
            // show start view
            var view = new View.StartScreen();
            $.fancybox.open(view.render());
        }
    },

    ShowDot: Backbone.View.extend({
        initialize: function () {
        },
        template: _.template($('#dot-popup-template').html()),
        events: {
            'click .dot-title': 'open'
        },
        open: function () {
            console.log('clicked');
        }
    }),

    AddDot: Backbone.View.extend({
        id: 'adddot-popup',
        className: 'popup',
        position: [],
        initialize: function () {
//            console.log('init')
        },
        template: _.template($('#adddot-popup-template').html()),
        render: function (position) {
            this.position = [position.latlng.lat + 0.21, position.latlng.lng];
            return this.$el.html(this.template());
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
            // check required fields
            var requiredCheck = 0;
            $('.required input').each(function () {
                if (!this.value) requiredCheck++
            });
            if (requiredCheck) {
                $('.required').addClass('highlight');
                return false;
            }

            // send json
            var _this = $(this.$el);

            _this.position = this.position;
            _this.layer = $(".input-layer", _this).val();
            _this.title = $(".input-title", _this).val();
            _this.text = $(".input-short-text", _this).val();
            _this.image = this.image;
            _this.icon = $("input[name='markerset']:checked", _this).val();
            _this.address = $(".input-address", _this).val();
            _this.street = $(".input-street", _this).val();
            _this.house = $(".input-house", _this).val();
            _this.homePhone = $(".input-home-phone", _this).val();

            console.log(this.image);

            if (BDots.records) {
                var dot = new BDot({
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
                    gallery: [] || null
                });

                // create FormData Object with files/json
                var fd = new FormData();

                var gallery_data = $('.input-gallery')[0].files;
                for (var j = 0; j < gallery_data.length; j++) {
                    fd.append("gallery_" + j, gallery_data[j]);
                }

                var other_data = JSON.stringify(dot);

                fd.append('json', other_data);

                // send
                dot.sync('post', fd, {
                    success: function (model) {
                        var response = JSON.parse(model);

                        delete response.__v;
                        delete response._id;
                        var dotValid = new BDot(response);
                        dotValid.attributes.marker = L.marker(response.position);

                        BDots.records.add(dotValid);

                        var view = new View.ShowDot(response);
                        L.marker(response.position, { icon: dot.getIcon() }).bindPopup(view.template(response)).addTo(map);

                        console.log('Dot created on server');
                    },
                    error: function (model, response) {
                        console.log('Dot creation server error!');
                        console.log(response.responseText);
                    }
                });
            }
            else throw Error('BDots.records don t exist');

            $.fancybox.close(_this);
            helper.status('Точка добавлена');
        },
        'file': helper.markerImageUpload
    }),

    MessagesDot: Backbone.View.extend({
        dot: null,
        dotId: null,
        initialize: function (obj) {
            this.dotId = obj.dotId;
            this.dot = BDots.records.get(this.dotId).attributes;

            // dot messages search
            var messagesFound = BMessages.records.where({ dotId: this.dotId, approved: true });
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
            helper.status('Сообщение отправлено и ожидает проверки');
        },
        'file': helper.singleImageUpload
    }),

    NewsScreen: Backbone.View.extend({
        messages: {},
        initialize: function () {
            var newsFound = BNews.records.where({ approved: true });
            newsFound = JSON.stringify(newsFound);
            this.messages = JSON.parse(newsFound);
        },
        id: 'news-screen',
        template: _.template($('#news-template').html()),
        render: function () {
            return this.$el.html(this.template(this));
        },
        events: {
            'click .input-submit': 'submit',
            'change .input-file': 'file'
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

            $('.popup-textarea', _this).attr('disabled', 'disabled').val('');
            $('.input-submit', _this).attr('disabled', 'disabled').addClass('popup-button-disabled');
            helper.status('Сообщение отправлено и ожидает проверки');
        },
        'file': helper.singleImageUpload
    }),

    AdsScreen: Backbone.View.extend({
        messages: {},
        initialize: function () {
            var adsFound = BAds.records.where({ approved: true });
            adsFound = JSON.stringify(adsFound);
            this.messages = JSON.parse(adsFound);
        },
        id: 'ads-screen',
        template: _.template($('#ads-template').html()),
        render: function () {
            return this.$el.html(this.template(this));
        },
        events: {
            'click .input-submit': 'submit',
            'change .input-file': 'file'
        },
        'submit': function () {
            var _this = $(this.$el);

            var adsItem = {
                id: this.dotId,
                text: $('.popup-textarea', _this).val(),
                image: this.image
            };

            console.log('all ok');
            $.post('/ads', adsItem, { success: function () {
                console.log('news item added')
            }, error: function (res) {
                console.log(res)
            } });

            $('.popup-textarea', _this).attr('disabled', 'disabled').val('');
            $('.input-submit', _this).attr('disabled', 'disabled').addClass('popup-button-disabled');
            helper.status('Сообщение отправлено и ожидает проверки');
        },
        'file': helper.singleImageUpload
    }),

    AnonymousScreen: Backbone.View.extend({
        messages: {},
        randomWelcome: helper.anonymousRandom(),
        initialize: function () {
            var anonymousFound = BAnonymous.records.where({ approved: true });
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
            'change .input-file': 'file'
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

            $('.popup-textarea', _this).attr('disabled', 'disabled').val('');
            $('.input-submit', _this).attr('disabled', 'disabled').addClass('popup-button-disabled');
            helper.status('Сообщение отправлено и ожидает проверки');
        },
        'file': helper.singleImageUpload
    }),

    LeadScreen: Backbone.View.extend({
        messages: {},
        initialize: function () {
            var leadFound = BLead.records.where({ approved: true });
            leadFound = JSON.stringify(leadFound);
            this.messages = JSON.parse(leadFound);
        },
        id: 'lead-screen',
        template: _.template($('#lead-template').html()),
        render: function () {
            return this.$el.html(this.template(this));
        },
        events: {
            'click .input-submit': 'submit',
            'change .input-file': 'file'
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

            $('.popup-textarea', _this).attr('disabled', 'disabled').val('');
            $('.input-submit', _this).attr('disabled', 'disabled').addClass('popup-button-disabled');
            helper.status('Сообщение отправлено и ожидает проверки');
        },
        'file': helper.singleImageUpload
    }),

    ClaimsScreen: Backbone.View.extend({
        messages: {},
        initialize: function () {
            var claimsFound = BClaims.records.where({ approved: true });
            claimsFound = JSON.stringify(claimsFound);
            this.messages = JSON.parse(claimsFound);
        },
        id: 'claims-screen',
        template: _.template($('#claims-template').html()),
        render: function () {
            return this.$el.html(this.template(this));
        },
        events: {
            'click .input-submit': 'submit',
            'change .input-file': 'file'
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

            $('.popup-textarea', _this).attr('disabled', 'disabled').val('');
            $('.input-submit', _this).attr('disabled', 'disabled').addClass('popup-button-disabled');
            helper.status('Жалоба отправлена и ожидает проверки');
        },
        'file': helper.singleImageUpload
    }),

    StartScreen: Backbone.View.extend({
        id: 'startscreen-popup',
        initialize: function () {
        },
        className: 'popup',
        template: _.template($('#startscreen-popup-template').html()),
        render: function () {
            return this.$el.html(this.template());
        },
        events: {
            'click #tab-news span': 'showNews',
            'click #tab-ads span': 'showAds',
            'click #tab-anonymous span': 'showAnonymous',
            'click #tab-lead span': 'showLead',
            'click #tab-claims span': 'showClaims'
        },
        'showNews': function () {
            var view = new View.NewsScreen();
            $('.tabs-wrapper').html(view.render());

            $('.fancybox-skin, .tabs').css('border-color', '#6B9B2A');
            $('.tabs li').removeClass('active');
            $('#tab-news').addClass('active');
        },
        'showAds': function () {
            var view = new View.AdsScreen();
            $('.tabs-wrapper').html(view.render());

            $('.fancybox-skin, .tabs').css('border-color', '#6B9B2A');
            $('.tabs li').removeClass('active');
            $('#tab-ads').addClass('active');
        },
        'showAnonymous': function () {
            var view = new View.AnonymousScreen();
            $('.tabs-wrapper').html(view.render());

            $('.fancybox-skin, .tabs').css('border-color', '#000');
            $('.tabs li').removeClass('active');
            $('#tab-anonymous').addClass('active');
        },
        'showLead': function () {
            var view = new View.LeadScreen();
            $('.tabs-wrapper').html(view.render());

            $('.fancybox-skin, .tabs').css('border-color', '#6B9B2A');
            $('.tabs li').removeClass('active');
            $('#tab-lead').addClass('active');
        },
        'showClaims': function () {
            var view = new View.ClaimsScreen();
            $('.tabs-wrapper').html(view.render());

            $('.fancybox-skin, .tabs').css('border-color', '#6B9B2A');
            $('.tabs li').removeClass('active');
            $('#tab-claims').addClass('active');
        }
    })
};