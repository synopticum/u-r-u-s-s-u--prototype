var map;
var socket = io('http://localhost');
var LeafIcon = L.Icon.extend({ options: { iconSize: [32, 32] } });
var BDots;

$.getJSON("/dots", function (data) {
    BDots = new BModel(data);
    initialize();
});

var BModel = Backbone.Model.extend({
    records: new Backbone.Collection(),
    layers: {},
    initialize: function (data) {
        /* create dots records */
        for (var item in data) {
            var dot = new BDot(data[item]);
            dot.marker = L.marker(dot.attributes.position, { icon: dot.getIcon() }).bindPopup(View.dot(dot));
            this.records.add(dot);
        }
        // set markers
        for (var record in this.records.models) {
            var marker = this.records.models[record];
            console.log(record)
            L.marker(marker.attributes.position).bindPopup('sex');
        }

        /* get map layers */
        var layers = [];

        for (var item in this.records.models) {
            layers.push(this.records.models[item].attributes.layer);
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
        for (var record in this.records.models) {
            var layerName = this.records.models[record].attributes.layer;

            if (layerName in this.layers) {
                var marker = this.records.models[record].marker;
                this.layers[layerName].push(marker);
            }
        }
    }
});

var BDot = Backbone.Model.extend({
    hui : "valuev",
    defaultImage: 'data:image/gif;base64,R0lGODlhUABQALMAAAAAAGtra/T09JycnKqqqtHR0SYmJunp6bi4uI2NjX19fcXFxUJCQlhYWN3d3f///yH5BAAAAAAALAAAAABQAFAAAATG8MlJq7046827/2AojmRpnmiqrmzrvnAsz3Rt33iu73zv/8CgcEgsGo/IpHLJbDqf0KhQgBgEAgrCQVpJAL7g70DAlTDC6ET5QQgsyIJFA1wokysCg3h9GXwDfBYEf4EVAV8EhRMFYFuKAnMAaooPCl8Gd4VeX3WKC2AIlA9nAAOiCF8MmYWWpaIPhwCdlLGzilYBDq+7vBUHBKGiB3qulIOXoscABqKQX8GiBY691NXW19jZ2tvc3d7f4OHi4+Tl5ufo6UARADs=',
    getImage: function () {
        if (this.attributes.image) return this.attributes.image;
        else return this.attributes.defaultImage;
    },
    icons: {
        red:   new LeafIcon({iconUrl: 'js/leaflet/images/markers/marker-icon-pink.png'}),
        blue:  new LeafIcon({iconUrl: 'js/leaflet/images/markers/marker-icon-blue.png'}),
        green: new LeafIcon({iconUrl: 'js/leaflet/images/markers/marker-icon-green.png'})
    },
    getIcon: function () {
        switch (this.attributes.icon) {
            case "red" :
                return this.icons.red;
                break;
            case "blue" :
                return this.icons.blue;
                break;
            case "green" :
                return this.icons.green;
                break;
            default :
                return this.icons.red;
                break;
        }
    }
});

// init
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
    Controller.addMapEvents();
}