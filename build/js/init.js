var map;
var socket = io('http://localhost');

$.getJSON("/dots", function (data) {
    Model.getRecords(data);
    Model.getLayers();
    initialize();
});

/* marker icon settings */
var LeafIcon = L.Icon.extend({
    options: { iconSize: [32, 32] }
});

// model
var Model = {
    records : {},
    layers  : {},
    getRecords : function (data) {
        // get records
        for (var item in data) {
            Model.records[item] = new Dot(data[item]);
            var dot = Model.records[item];
            dot.marker = L.marker(dot.position, { icon: dot.getIcon() })
                .bindPopup(Dot.prototype.popupTemplate.call(dot, dot));
        }
        // set markers
        for (var item in Model.records) {
            var dot = Model.records[item];
            L.marker(dot.position, { icon: dot.getIcon() }).bindPopup(dot.popupTemplate(dot));
        }
    },
    getLayers: function () {
        var layers = [];
        // get array of layer value's for each item
        for (var item in Model.records) {
            layers.push(Model.records[item].layer)
        }
        // remove duplicates
        layers = layers.filter(function(elem, pos) {
            return layers.indexOf(elem) == pos;
        });
        // apply array to Model.layers
        for (var i = 0; i < layers.length; i++) {
            Model.layers[layers[i]] = [];
        }
        // fill Model.layers
        for (var item in Model.records) {
            var layerName = Model.records[item].layer;
            if (layerName in Model.layers) {
                var dot = Model.records[item];
                var marker = Model.records[item].marker;
                Model.layers[layerName].push(marker);
            }
        }
    },
    newRecord : true,
    create: function (url, callback) {
        // create on client
        this.newRecord = false;
        Model.records[this.id] = this;
        // create on server
        $.post(url, JSON.stringify(this), callback);
        console.log('dot created ' + this.id);
    },
    update: function (url, callback) {
        // create on client
        Model.records[this.id] = this;
        // update on server
        $.post(url, JSON.stringify(this), callback);
        console.log('dot updated ' + this.id);
    },
    save: function (url, callback) {
        this.newRecord ? this.create() : this.update();
        console.log('dot saved ' + this.id);
    },
    destroy: function (url, callback) {
        delete Model.records[this.id];
        // remove from server
        $.post(url, JSON.stringify(this), callback);
        console.log('dot destroyed ' + this.id);
    },
    find: function (id) {
        var record = this.records[id];
        if (!record) throw('Unknown record id');
        return record;
    },
    dup: function () {
        return $.extend(true, {}, this);
    },
    init: function () {
        var instance = Object.create(this.prototype);
        instance.parent = this;
        instance.init.apply(instance, arguments);
        return instance;
    }
};

// Dot constructor
Dot = function (item) {
    $.extend(this, item);
};
Dot.prototype = Object.create(Model);

$.extend(Dot.prototype, {
    imageDefault: 'data:image/gif;base64,R0lGODlhUABQALMAAAAAAGtra/T09JycnKqqqtHR0SYmJunp6bi4uI2NjX19fcXFxUJCQlhYWN3d3f///yH5BAAAAAAALAAAAABQAFAAAATG8MlJq7046827/2AojmRpnmiqrmzrvnAsz3Rt33iu73zv/8CgcEgsGo/IpHLJbDqf0KhQgBgEAgrCQVpJAL7g70DAlTDC6ET5QQgsyIJFA1wokysCg3h9GXwDfBYEf4EVAV8EhRMFYFuKAnMAaooPCl8Gd4VeX3WKC2AIlA9nAAOiCF8MmYWWpaIPhwCdlLGzilYBDq+7vBUHBKGiB3qulIOXoscABqKQX8GiBY691NXW19jZ2tvc3d7f4OHi4+Tl5ufo6UARADs=',
    icons: {
        red:   new LeafIcon({iconUrl: 'js/leaflet/images/markers/marker-icon-pink.png'}),
        blue:  new LeafIcon({iconUrl: 'js/leaflet/images/markers/marker-icon-blue.png'}),
        green: new LeafIcon({iconUrl: 'js/leaflet/images/markers/marker-icon-green.png'})
    },
    popupTemplate: function (context) {
        var dot = context;

        return '<div class="dot-view">'
            + '<a href="gallery/' + dot.id + '/1.jpg" class="fancybox" data-fancybox-group="gallery' + dot.id + '"><img src="' + dot.getImage() + '" class="dot-image"></a>'
            + '<a href="gallery/98/2.jpg" class="fancybox" data-fancybox-group="gallery98" style="display:none;"></a>'
            + '<a href="feeds/' + dot.id + '" class="dot-chat"></a>'
            + '</div>'

            + '<div class="dot-short-text">'
            + '<div class="dot-title">' + dot.title + '</div>'

            + dot.shortText

            + '<table class="dot-contacts">'
            + '<tr><td colspan="2" class="dot-address">Адрес: <mark>' + dot.address + '</mark></td></tr>'
            + '<tr><td class="dot-home-phone">тел.: <mark>' + dot.homePhone + '</mark></td>' + '<td class="dot-mobile-phone">моб.: <mark>' + dot.mobilePhone + '</mark></td></tr>'
            + '</table>'
            + '</div>'
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

function initialize() {
    var mapMinZoom = 4;
    var mapMaxZoom = 5;

    var mainLayer   = L.layerGroup(Model.layers.main);
    var secondLayer = L.layerGroup(Model.layers.second);

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

    // add marker on map click
    map.addEventListener('click', function (e) {
        var that = $('#placeDot');
        $.fancybox.open(that);
        $('.input-position', that).val([e.latlng.lat, e.latlng.lng]).attr('disabled', 'disabled');
    });
}

// id generator
Math.guid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
        function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        }).toUpperCase();
};