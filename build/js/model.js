var BDot = Backbone.Model.extend({
    urlRoot : '/dot',
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