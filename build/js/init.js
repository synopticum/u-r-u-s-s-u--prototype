var map;
var socket = io('http://localhost');
var LeafIcon = L.Icon.extend({ options: { iconSize: [32, 32] } });

$.getJSON("/dots", function (data) {
    getRecords(data, Dots);
    getLayers(Dots);
    initialize();
});

// base Model
var Model = {
    inherited: function () {},
    created: function () {
        this.records = {};
    },
    prototype: {
        init: function (atts) {
            if (atts) this.load(atts);
        },
        load: function (attributes) {
            for (var name in attributes) {
                this[name] = attributes[name];
            }
        }
    },
    // create from Model(copy Model)
    create: function () {
        var object = Object.create(this);
        object.parent = this;
        object.prototype = object.fn = Object.create(this.prototype);

        object.created();
        this.inherited(object);
        return object;
    },
    // create from Model.prototype
    init: function () {
        var instance = Object.create(this.prototype);
        instance.parent = this;
        instance.init.apply(instance, arguments);
        return instance;
    },
    extend: function (o) {
        var extended = o.extended;
        $.extend(this, o);
        if (extended) extended(this);
    },
    include: function (o) {
        var included = o.included;
        $.extend(this.prototype, o);
        if (included) included(this);
    },
    records: {}
};

// extend Model
Model.extend({
    find: function (id) {
        var record = this.records[id];
        if (!record) throw Error('Unknown ID');
        return record.dup();
    }
});

// extend Model.prototype
Model.include({
    newRecord: true,
    create: function () {
        if (!this.id) this.id = Math.guid();
        this.newRecord = false;
        this.parent.records[this.id] = this.dup();
        console.log('Created: ' + this.id);
    },
    destroy: function () {
        delete this.parent.records[this.id];
    },
    update: function () {
        this.parent.records[this.id] = this.dup();
    },
    save: function () {
        this.newRecord ? this.create() : this.update();
    },
    dup: function () {
        return $.extend(true, {}, this);
    }
});

// Dots Model
var Dots = Model.create();

Dots.extend({ layers : {} });

Dots.include({
    imageDefault: 'data:image/gif;base64,R0lGODlhUABQALMAAAAAAGtra/T09JycnKqqqtHR0SYmJunp6bi4uI2NjX19fcXFxUJCQlhYWN3d3f///yH5BAAAAAAALAAAAABQAFAAAATG8MlJq7046827/2AojmRpnmiqrmzrvnAsz3Rt33iu73zv/8CgcEgsGo/IpHLJbDqf0KhQgBgEAgrCQVpJAL7g70DAlTDC6ET5QQgsyIJFA1wokysCg3h9GXwDfBYEf4EVAV8EhRMFYFuKAnMAaooPCl8Gd4VeX3WKC2AIlA9nAAOiCF8MmYWWpaIPhwCdlLGzilYBDq+7vBUHBKGiB3qulIOXoscABqKQX8GiBY691NXW19jZ2tvc3d7f4OHi4+Tl5ufo6UARADs=',
    icons: {
        red:   new LeafIcon({iconUrl: 'js/leaflet/images/markers/marker-icon-pink.png'}),
        blue:  new LeafIcon({iconUrl: 'js/leaflet/images/markers/marker-icon-blue.png'}),
        green: new LeafIcon({iconUrl: 'js/leaflet/images/markers/marker-icon-green.png'})
    },
    getImage: function () {
        if (this.image) return this.image;
        else return this.imageDefault;
    },
    getIcon: function () {
        switch (this.icon) {
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

// Controller init
if (Dots.records && Dots.layers) {
    function initialize() {

        var mapMinZoom = 4;
        var mapMaxZoom = 5;

        var mainLayer   = L.layerGroup(Dots.layers.main);
        var secondLayer = L.layerGroup(Dots.layers.second);

        var staticLayers = {
            "Models": mainLayer
        };

        var dynamicLayers = {
            "Second Layer": secondLayer
        };

        map = L.map('map', { layers: [mainLayer, secondLayer] });

        // map default view & draggable area
        map.setView([70, 10], 5);
        map.setMaxBounds([ [5, -180], [122, 100] ]);

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
        Controller.addEvents();
    }
}
else throw Error('Initialization error : records or layers not found');

// get records from JSON to Dots model
getRecords = function (data, model) {
    if (data && model) {
        // get records
        for (var item in data) {
            var dot = model.records[item] = Dots.init(data[item]);
            dot.marker = L.marker(dot.position, { icon: dot.getIcon() }).bindPopup(View.dot(dot));
        }
        // set markers
        for (var record in model.records) {
            var marker = model.records[record];
            L.marker(marker.position, { icon: marker.getIcon() }).bindPopup(View.dot(marker));
        }
    }
    else throw Error('Data or Model error');
};

// get layers from records of Dots model
getLayers = function (model) {
    var layers = [];
    // get array of layer value's for each item
    for (var item in model.records) {
        layers.push(model.records[item].layer)
    }
    // remove duplicates
    layers = layers.filter(function(elem, pos) {
        return layers.indexOf(elem) == pos;
    });
    // apply array to Dots.layers
    for (var i = 0; i < layers.length; i++) {
        model.layers[layers[i]] = [];
    }
    // fill Dots.layers
    for (var record in model.records) {
        var layerName = model.records[record].layer;
        if (layerName in model.layers) {
            var marker = model.records[record].marker;
            model.layers[layerName].push(marker);
        }
    }
};

// id generator
Math.guid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
        function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        }).toUpperCase();
};