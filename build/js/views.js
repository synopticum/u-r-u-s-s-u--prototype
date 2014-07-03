var map;
var LeafIcon = L.Icon.extend({ options: { iconSize: [32, 32] } });

var View = {
    map: {
        init: function () {
            var mapMinZoom = 4;
            var mapMaxZoom = 5;

            var mainLayer = L.layerGroup(BDots.layers.main);
            var secondLayer = L.layerGroup(BDots.layers.second);

            var staticLayers = {
                "Models": mainLayer
            };

            var dynamicLayers = {
                "Second Layer": secondLayer
            };

            map = L.map('map', { layers: [mainLayer, secondLayer] });

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

            // set dot
            map.on('click', function (position) {
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

                $('.fancybox').fancybox();
            });
        },
        hideLoadScreen : $('#clouds').fadeOut(2000)
    },

    showDot : Backbone.View.extend({
        initialize: function () {
//            console.log(model)
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
                    title       : _this.title || "Уруссинское отделение полиции",
                    text        : _this.text || "Нет у вас методов против Кости Сапрыкина.",
                    image       : _this.image || new BDot().defaultImage,
                    icon        : _this.icon,
                    address     : _this.address || "пр.",
                    street      : _this.street || "имени Китайской Революции",
                    house       : _this.house || "19",
                    homePhone   : _this.homePhone || "2-12-48",
                    mobilePhone : _this.mobilePhone || "(937) 460-78-74",
                    gallery     : [] || null,
                    marker      : L.marker(_this.position)
                });

                // create FormData Object with files/json
                var fd = new FormData();

                var file_data = $('.input-image')[0].files;
                for(var i = 0; i < file_data.length; i++){
                    fd.append("file_" + i, file_data[i]);
                }

                var gallery_data = $('.input-gallery')[0].files;
                for(var j = 0; j < gallery_data.length; j++){
                    fd.append("gallery_" + j, gallery_data[j]);
                }

                var other_data = JSON.stringify(dot);

                fd.append('json', other_data);

                dot.sync('post', fd, {
                    success: function(model, response){
                        var response = JSON.parse(model);

                        delete response.__v;
                        delete response._id;
                        var dotValid = new BDot(response);

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

            var dot = new BDot({
                id          : _this.id,
                template    : null,
                byUser      : null,
                layer       : _this.layer,
                position    : _this.position,
                title       : _this.title || "Уруссинское отделение полиции",
                text        : _this.text || "Нет у вас методов против Кости Сапрыкина.",
                image       : _this.image,
                icon        : _this.icon,
                address     : _this.address || "пр.",
                street      : _this.street || "имени Китайской Революции",
                house       : _this.house || "19",
                homePhone   : _this.homePhone || "2-12-48",
                mobilePhone : _this.mobilePhone || "(937) 460-78-74",
                gallery     : [] || null
            });

            if (BDots.records) {
                // create FormData Object with files/json
                var fd = new FormData();

                var file_data = $('.input-image')[0].files;
                var other_data = JSON.stringify(dot);

                for(var i = 0; i < file_data.length; i++){
                    fd.append("file_" + i, file_data[i]);
                }

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
                        console.log('dot removed from server!!');
                        console.log(response);
                    },
                    error: function(model, response){
                        console.log('dot remove server error!');
                        console.log(response.responseText);
                    }
                });
            }
            else throw Error('BDots.records don t exist');

            map.removeLayer(this.dot.marker);
            $.fancybox.close(_this);
            helper.status('Точка удалена');
        }
    })
};