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
            map.on('click', View.map.setMarker);
            map.on('popupopen', function (e) {
                console.log($(this));
                $(this._popup._wrapper).find('.dot-title').click(function () {
                    alert('clicked');
                })
            });
        },
        setMarker : function (position) {
            var view = new View.addDot();
            $.fancybox.open(view.render(position));
            $(".selectbox").selectbox();
            $(".markerset").buttonset();
        },
        hideLoadScreen : $('#clouds').fadeOut(2000)
    },

    showDot : Backbone.View.extend({
        initialize: function () {
//        console.log('init')
        },
        template: _.template($('#dot-popup-template').html()),
        events: {
            'click .dot-title': 'open'
        },
        open: function() {
            console.log('clicked');
        }
    }),

    addDot : Backbone.View.extend({
        id: 'adddot-popup',
        className: 'popup',
        position: [],
        initialize: function () {
//            console.log('init')
        },
        template: _.template($('#adddot-popup-template').html()),
        render: function(position) {
            this.position = [position.latlng.lat, position.latlng.lng];
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
            var that = $(this.$el);

            that.position    = this.position;
            that.layer       = $(".input-layer", that).val();
            that.title       = $(".input-title", that).val();
            that.text        = $(".input-short-text", that).val();
            that.image       = $(".input-image", that).val();
            that.icon        = $("input[name='markerset']:checked", that).val();
            that.address     = $(".input-address", that).val();
            that.street      = $(".input-street", that).val();
            that.house       = $(".input-house", that).val();
            that.homePhone   = $(".input-home-phone", that).val();
            that.mobilePhone = $(".input-mobile-phone", that).val();

            var dot = new BDot({
                id          : helper.guid(),
                template    : null,
                byUser      : null,
                layer       : that.layer,
                position    : that.position,
                title       : that.title || "default title",
                text        : that.text || "default description",
                image       : that.image || new BDot().defaultImage,
                icon        : that.icon,
                address     : that.address || "dst.",
                street      : that.street || "Default Street",
                house       : that.house || "666",
                homePhone   : that.homePhone || "default phone",
                mobilePhone : that.mobilePhone || "default mobile",
                gallery     : [] || null
            });
            if (BDots.records) {
                BDots.records.add(dot);
                dot.save(null, {
                    success: function(model, response){
                        console.log('dot created on server!!');
                        console.log(response);
                    },
                    error: function(model, response){
                        console.log('creation server error!');
                        console.log(response);
                    }});
            }
            else throw Error('BDots.records don t exist');

            var view = new View.showDot();
            L.marker(dot.attributes.position, { icon: dot.getIcon() }).bindPopup(view.template(dot.attributes)).addTo(map);

            $.fancybox.close(that);
        }
    })
};