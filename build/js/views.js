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

            map.on('load', (function () {
                $('#clouds').fadeOut(2000);
                View.Map.showStartScreen();
                $('body').addClass('user');
            })());

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
    },

    ShowDot: Backbone.View.extend({
        template: _.template($('#dot-popup-template').html())
    }),

    AddDot: Backbone.View.extend({
        id: 'adddot-popup',
        className: 'popup',
        position: [],
        template: _.template($('#adddot-popup-template').html()),
        render: function (position) {
            this.position = [position.latlng.lat + 0.21, position.latlng.lng];
            return this.$el.html(this.template());
        },
        events: {
            'click .input-submit': 'submit',
            'click .input-marker': 'select-marker-open',
            'click #selectMarkerPopup input': 'select-marker-close',
            'change .input-file': 'file',
            'change .input-gallery': 'gallery'
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
            _this.track = $(".input-track", _this).val();
            _this.gallery = this.gallery;

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
                    track: _this.track,
                    gallery: _this.gallery
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

                        L.marker(response.position, { icon: dot.getIcon() }).addTo(map);
                    },
                    error: function (model, response) {
                        console.log('Dot creation server error!');
                        console.log(response.responseText);
                    }
                });
            }
            else throw Error('BDots.records don t exist');

            $.fancybox.close(_this);

            helper.playSend();
            helper.status('Точка добавлена');
        },
        'file': helper.markerImageUpload,
        'gallery': helper.galleryUpload
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

            $.post('/messages', message, { error: function (res) {
                console.log(res)
            }});

            $.fancybox.close(_this);

            helper.playSend();
            helper.status('Сообщение отправлено и ожидает проверки');
        },
        'file': helper.singleImageUpload
    }),

    NewsScreen: Backbone.View.extend({
        messages: {},
        user: {},
        initialize: function () {
            var newsFound = BNews.records.where({ approved: true });
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

            $.post('/news', newsItem, { error: function (res) {
                console.log(res)
            }});

            helper.disableInputs();
            helper.playSend();
            helper.status('Сообщение отправлено и ожидает проверки');
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
    }),

    AdsScreen: Backbone.View.extend({
        messages: {},
        user: {},
        initialize: function () {
            var adsFound = BAds.records.where({ approved: true });
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

            $.post('/ads', adsItem, { error: function (res) {
                console.log(res)
            }});

            helper.disableInputs();
            helper.playSend();
            helper.status('Сообщение отправлено и ожидает проверки');
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
    }),

    AnonymousScreen: Backbone.View.extend({
        messages: {},
        random: helper.anonymousRandom(),
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

            $.post('/anonymous', anonymousItem, { error: function (res) {
                console.log(res)
            }});

            helper.disableInputs();
            helper.playSend();
            helper.status('Сообщение отправлено и ожидает проверки');
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
    }),

    LeadScreen: Backbone.View.extend({
        messages: {},
        user: {},
        random: helper.leadRandom(),
        initialize: function () {
            var leadFound = BLead.records.where({ approved: true });
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

            $.post('/lead', leadItem, { error: function (res) {
                console.log(res)
            }});

            helper.disableInputs();
            helper.playSend();
            helper.status('Сообщение отправлено и ожидает проверки');
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
    }),

    ClaimsScreen: Backbone.View.extend({
        messages: {},
        user: {},
        initialize: function () {
            var claimsFound = BClaims.records.where({ approved: true });
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

            $.post('/claims', claimsItem, { error: function (res) {
                console.log(res)
            }});

            helper.disableInputs();
            helper.playSend();
            helper.status('Жалоба отправлена и ожидает проверки');
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
            'click #tab-claims span': 'showClaims',
            'click #update': 'updateModel',
            'mouseover .nrefresh': function () { $('.n-refresh, #update').addClass('active'); },
            'mouseout .nrefresh': function () { $('.n-refresh, #update').removeClass('active'); },
            'mouseover .nmain': function () { $('.n-main').addClass('active'); },
            'mouseout .nmain': function () { $('.n-main').removeClass('active'); },
            'mouseover .nadd': function () { $('.n-add').addClass('active'); },
            'mouseout .nadd': function () { $('.n-add').removeClass('active'); },
            'mouseover .nanon': function () { $('.n-anon').addClass('active'); },
            'mouseout .nanon': function () { $('.n-anon').removeClass('active'); },
            'mouseover .npremod': function () { $('.n-premod').addClass('active'); },
            'mouseout .npremod': function () { $('.n-premod').removeClass('active'); },
            'mouseover .nvk': function () { $('.n-vk').addClass('active'); },
            'mouseout .nvk': function () { $('.n-vk').removeClass('active'); }
        },
        'showNews': function () {
            var view = new View.NewsScreen();
            $('.tabs-wrapper').html(view.render());

            $('.fancybox-skin, .tabs').css('border-color', '#6B9B2A');
            $('.tabs li').removeClass('active');
            $('#tab-news').addClass('active');

            $('.dot-messages-image a').click(helper.singleImage);
        },
        'showAds': function () {
            var view = new View.AdsScreen();
            $('.tabs-wrapper').html(view.render());

            $('.fancybox-skin, .tabs').css('border-color', '#6B9B2A');
            $('.tabs li').removeClass('active');
            $('#tab-ads').addClass('active');

            $('.dot-messages-image a').click(helper.singleImage);
            $(".input-ads-phone").inputmask("+7 (999) 999-99-99");
        },
        'showAnonymous': function () {
            var view = new View.AnonymousScreen();
            $('.tabs-wrapper').html(view.render());

            $('.fancybox-skin, .tabs').css('border-color', '#000');
            $('.tabs li').removeClass('active');
            $('#tab-anonymous').addClass('active');

            $('.dot-messages-image a').click(helper.singleImage);
        },
        'showLead': function () {
            var view = new View.LeadScreen();
            $('.tabs-wrapper').html(view.render());

            $('.fancybox-skin, .tabs').css('border-color', '#6B9B2A');
            $('.tabs li').removeClass('active');
            $('#tab-lead').addClass('active');

            $('.dot-messages-image a').click(helper.singleImage);
        },
        'showClaims': function () {
            var view = new View.ClaimsScreen();
            $('.tabs-wrapper').html(view.render());

            $('.fancybox-skin, .tabs').css('border-color', '#6B9B2A');
            $('.tabs li').removeClass('active');
            $('#tab-claims').addClass('active');

            $('.dot-messages-image a').click(helper.singleImage);
        }
    })
};