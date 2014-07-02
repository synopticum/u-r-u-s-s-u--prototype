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
                record.destroy({
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

            $.fancybox.close(_this);
            map.removeLayer(this.dot.marker);
            helper.status('Точка удалена');
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
                image       : _this.image || BDot.defaultImage,
                icon        : _this.icon,
                address     : _this.address || "пр.",
                street      : _this.street || "имени Китайской Революции",
                house       : _this.house || "19",
                homePhone   : _this.homePhone || "2-12-48",
                mobilePhone : _this.mobilePhone || "(937) 460-78-74",
                gallery     : [] || null
            });

            if (BDots.records) {
                dot.save(null, {
                    success: function(model, response){
                        var record = BDots.records.get(response.id);
                        record.set(response);

                        map.removeLayer(_this.marker);

                        var view = new View.showDot(record.attributes);
                        L.marker(record.attributes.position, { icon: record.getIcon() }).bindPopup(view.template(record.attributes)).addTo(map);

                        console.log('Dot updated on server');
                    },
                    error: function(model, response){
                        console.log('Dot update server error!');
                        console.log(response.responseText);
                    }
                });
            }
            else throw Error('BDots.records don t exist');

            $.fancybox.close(_this);
            helper.status('Точка изменена');
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
            // ajax send file - FormData Multipart
            var data, xhr;
            var inputImageFiles = document.querySelector('.input-image').files;

            data = new FormData();

//            for(var i = 0; i < inputImageFiles.length; i++){
//                data.append("file_"+ i, inputImageFiles[i]);
//            }

            data.append("image_", inputImageFiles[0]);

            xhr = new XMLHttpRequest();

            xhr.open( 'POST', '/upload', true );
            xhr.onreadystatechange = function (response) {};
            xhr.send(data);

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

                dot.save(null, {
                    success: function(model, response){
                        console.log('Dot created on server');

                        delete response.__v;
                        delete response._id;
                        var dotValid = new BDot(response);

                        BDots.records.add(dotValid);

                        var view = new View.showDot(dot.attributes);
                        L.marker(dot.attributes.position, { icon: dot.getIcon() }).bindPopup(view.template(dot.attributes)).addTo(map);
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
    })
};