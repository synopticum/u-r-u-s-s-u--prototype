var map;
var LeafIcon = L.Icon.extend({ options: { iconSize: [32, 32] } });

var View = {
    map: {
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

            map.on('load', View.map.hideLoadScreen);
            map.on('load', View.map.showStartScreen());

            // set dot
            map.on('dblclick', function (position) {
                var view = new View.addDot();
                $.fancybox.open(view.render(position));
                $(".selectbox").selectbox();
                $(".markerset").buttonset();
            });

            // edit dot
            map.on('popupopen', function (e) {
                var popupId = $(this._popup._wrapper).find('.dot-container').attr('id');

                $(this._popup._wrapper).find('.dot-edit').click(function () {
                    var view = new View.editDot({ dotId: popupId });
                    $.fancybox.open(view.render());
                    $(".selectbox").selectbox();
                    $(".markerset").buttonset();
                });

                $(this._popup._wrapper).find('.dot-destroy').click(function () {
                    var view = new View.removeDot({ dotId: popupId });
                    $.fancybox.open(view.render());
                });

                $(this._popup._wrapper).find('.dot-messages').click(function () {
                    var view = new View.messagesDot({ dotId: popupId });
                    $.fancybox.open(view.render());
                });

                $('.fancybox').fancybox();
            });
        },
        hideLoadScreen : $('#clouds').fadeOut(2000),
        showStartScreen : function () {
            // show start view
            var view = new View.startScreen();
            $.fancybox.open(view.render());
        }
    },

    showDot : Backbone.View.extend({
        initialize: function () {
        },
        template: _.template($('#dot-popup-template').html()),
        events: {
            'click .dot-title': 'open'
        },
        open: function() {
            console.log('clicked');
        }
    }),

    addDot: Backbone.View.extend({
        id: 'adddot-popup',
        className: 'popup',
        position: [],
        initialize: function () {
//            console.log('init')
        },
        template: _.template($('#adddot-popup-template').html()),
        render: function(position) {
            this.position = [position.latlng.lat+0.21, position.latlng.lng];
            return this.$el.html(this.template());
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
            // check required fields
            var requiredCheck = 0;
            $('.required input').each(function (e) {
                if (!this.value) requiredCheck++
            });
            if (requiredCheck) {
                $('.required').addClass('highlight');
                return false;
            }

            // send json
            var _this = $(this.$el);

            _this.position    = this.position;
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

            if (BDots.records) {
                var dot = new BDot({
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
                    gallery     : [] || null
                });

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

                // send
                dot.sync('post', fd, {
                    success: function(model, response){
                        var response = JSON.parse(model);

                        delete response.__v;
                        delete response._id;
                        var dotValid = new BDot(response);
                        dotValid.attributes.marker = L.marker(response.position);

                        BDots.records.add(dotValid);

                        var view = new View.showDot(response);
                        L.marker(response.position, { icon: dot.getIcon() }).bindPopup(view.template(response)).addTo(map);

                        console.log('Dot created on server');
                    },
                    error: function(model, response){
                        console.log('Dot creation server error!');
                        console.log(response.responseText);
                    }
                });
            }
            else throw Error('BDots.records don t exist');

            $.fancybox.close(_this);
            helper.status('Точка добавлена');
        }
    }),

    editDot: Backbone.View.extend({
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
                    success: function(model, response){
                        var response = JSON.parse(model);

                        delete response.__v;
                        delete response._id;

                        var record = BDots.records.get(response.id);
                        record.set(response);

                        map.removeLayer(_this.marker);

                        var view = new View.showDot(response.attributes);
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
    }),

    removeDot: Backbone.View.extend({
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
    }),

    messagesDot: Backbone.View.extend({
        dot: null,
        dotId: null,
        initialize: function (obj) {
            this.dotId = obj.dotId;
            this.dot = BDots.records.get(this.dotId).attributes;

            // dot messages search
            var messagesFound = BMessages.records.where({ dotId: this.dotId, approved : true });
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
            'click .input-submit': 'submit'
        },
        'submit': function() {
            var _this = $(this.$el);
            var message = {
                id: this.dotId,
                text: $('.popup-textarea' ,_this).val()
            };

            $.post('/messages', message, { success: function (res) {
                console.log('message added')
            }, error: function (res) {
                console.log(res)
            } });

            $.fancybox.close(_this);
            helper.status('Сообщение отправлено');
        }
    }),

    newsScreen: Backbone.View.extend({
        messages : {},
        initialize: function () {
            var newsFound = BNews.records.where({ approved: true });
            newsFound = JSON.stringify(newsFound);
            this.messages = JSON.parse(newsFound);
        },
        id: 'news-screen',
        template: _.template($('#news-template').html()),
        render: function() {
            return this.$el.html(this.template(this));
        },
        events: {
            'click .input-submit': 'submit'
        },
        'submit': function() {
            var _this = $(this.$el);
            var newsItem = {
                id: this.dotId,
                text: $('.popup-textarea' ,_this).val()
            };

            $.post('/news', newsItem, { success: function (res) {
                console.log('news item added')
            }, error: function (res) {
                console.log(res)
            } });

            helper.status('Новость отправлена');
        }
    }),

    startScreen: Backbone.View.extend({
        id: 'startscreen-popup',
        initialize: function () {
        },
        className: 'popup',
        template: _.template($('#startscreen-popup-template').html()),
        render: function() {
            return this.$el.html(this.template());
        },
        events: {
            'click #tab-news': 'showNews'
        },
        'showNews': function() {
            var view = new View.newsScreen();
            $('.tabs-wrapper').html(view.render());
        }
    })
};