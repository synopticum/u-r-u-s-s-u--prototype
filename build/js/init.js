var map;
var socket = io('http://localhost');
var LeafIcon = L.Icon.extend({ options: { iconSize: [32, 32] } });

// Dot Model
var BDot = Backbone.Model.extend({
    url: "/dot",
    defaultImage: 'data:image/gif;base64,R0lGODlhUABQALMAAAAAAGtra/T09JycnKqqqtHR0SYmJunp6bi4uI2NjX19fcXFxUJCQlhYWN3d3f///yH5BAAAAAAALAAAAABQAFAAAATG8MlJq7046827/2AojmRpnmiqrmzrvnAsz3Rt33iu73zv/8CgcEgsGo/IpHLJbDqf0KhQgBgEAgrCQVpJAL7g70DAlTDC6ET5QQgsyIJFA1wokysCg3h9GXwDfBYEf4EVAV8EhRMFYFuKAnMAaooPCl8Gd4VeX3WKC2AIlA9nAAOiCF8MmYWWpaIPhwCdlLGzilYBDq+7vBUHBKGiB3qulIOXoscABqKQX8GiBY691NXW19jZ2tvc3d7f4OHi4+Tl5ufo6UARADs=',
    getIcon: function () {
        switch (this.attributes.icon) {
            case "red" :
                return new LeafIcon({iconUrl: 'js/leaflet/images/markers/marker-icon-pink.png'});
                break;
            case "blue" :
                return new LeafIcon({iconUrl: 'js/leaflet/images/markers/marker-icon-blue.png'});
                break;
            case "green" :
                return new LeafIcon({iconUrl: 'js/leaflet/images/markers/marker-icon-green.png'});
                break;
            case "grayred" :
                return new LeafIcon({iconUrl: 'js/leaflet/images/markers/marker-icon-g-pink.png'});
                break;
            case "grayblue" :
                return new LeafIcon({iconUrl: 'js/leaflet/images/markers/marker-icon-g-blue.png'});
                break;
            case "graygreen" :
                return new LeafIcon({iconUrl: 'js/leaflet/images/markers/marker-icon-g-green.png'});
                break;
            default :
                return new LeafIcon({iconUrl: 'js/leaflet/images/markers/marker-icon-green.png'});
                break;
        }
    }
});

// Main Model
var BDots;

var Collection = new Backbone.Collection();

var BModel = Backbone.Model.extend({
    records: Collection,
    layers: {},
    initialize: function (data) {
        /* create dots records */
        for (var jsonItem in data) {
            var model = new BDot(data[jsonItem]);
            var view = new View.showDot();

            model.attributes.marker = L.marker(model.attributes.position, { icon: model.getIcon() })
                .bindPopup(view.template(model.attributes));

            this.records.add(model);

            L.marker(model.attributes.position, { icon: model.getIcon() })
                .bindPopup(view.template(model.attributes))
        }

        var records = this.records.models;

        // set markers
        for (var record in records) {
            L.marker(records[record].attributes.position)
                .bindPopup(view.template(model.attributes));
        }

        /* get map layers */
        var layers = [];

        for (record in records) {
            layers.push(records[record].attributes.layer);
        }
        // remove duplicates
        layers = layers.filter(function (elem, pos) {
            return layers.indexOf(elem) == pos;
        });
        // apply array to BDots.layers
        for (var i = 0; i < layers.length; i++) {
            this.layers[layers[i]] = [];
        }
        // fill BDots.layers
        for (record in records) {
            var layerName = records[record].attributes.layer;

            if (layerName in this.layers) {
                var marker = records[record].attributes.marker;
                this.layers[layerName].push(marker);
            }
        }
    }
});

// init
$.getJSON("/dots", function (data) {
    BDots = new BModel(data);
    initialize();
});

function initialize() {
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

    // add listeners
    View.map.init();

    // plugins
    $(".selectbox").selectbox();
    $(".markerset").buttonset();
}