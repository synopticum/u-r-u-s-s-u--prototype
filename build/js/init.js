var map;
var socket = io('http://localhost');

/* marker icon settings */
var LeafIcon = L.Icon.extend({
    options: { iconSize:     [32, 32] }
});

// model constructor
var Dots = function (data) {
    this.records = JSON.parse(data);
};

// dot constructor
Dot = function (obj) {
    this.getImage = function () {
        if (this.image) return this.image;
        else return this.imageDefault;
    };

    this.getIcon = function () {
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
    $.extend(this, obj)
};

Dot.prototype = {
    imageDefault : 'data:image/gif;base64,R0lGODlhUABQALMAAAAAAGtra/T09JycnKqqqtHR0SYmJunp6bi4uI2NjX19fcXFxUJCQlhYWN3d3f///yH5BAAAAAAALAAAAABQAFAAAATG8MlJq7046827/2AojmRpnmiqrmzrvnAsz3Rt33iu73zv/8CgcEgsGo/IpHLJbDqf0KhQgBgEAgrCQVpJAL7g70DAlTDC6ET5QQgsyIJFA1wokysCg3h9GXwDfBYEf4EVAV8EhRMFYFuKAnMAaooPCl8Gd4VeX3WKC2AIlA9nAAOiCF8MmYWWpaIPhwCdlLGzilYBDq+7vBUHBKGiB3qulIOXoscABqKQX8GiBY691NXW19jZ2tvc3d7f4OHi4+Tl5ufo6UARADs=',
    iconsPath    : 'js/leaflet/images/markers/',
    icons : {
        red   : new LeafIcon({iconUrl: 'js/leaflet/images/markers/marker-icon-pink.png'}),
        blue  : new LeafIcon({iconUrl: 'js/leaflet/images/markers/marker-icon-blue.png'}),
        green : new LeafIcon({iconUrl: 'js/leaflet/images/markers/marker-icon-green.png'})
    }
};
// final array
var dotsReady = [];

/* map loading bar */
$(window).load(function(){
    $('#clouds').fadeOut(2000);
});

/* map initialize */
socket.on('news', function (data) {
    // creating model
    var dots = new Dots(data);

    for (var item in dots.records) {
        var dot = new Dot(dots.records[item]);

        dot.id     = Number(dot.id);
        dot.byUser = Boolean(dot.byUser);
        dot.icon   = dot.getIcon();
        dot.image  = dot.getImage();

        var marker = L.marker(dot.position, { icon: dot.icon }).bindPopup(
                '<img src="' + dot.image + '" class="dot-image">'
                + '<div class="dot-short-text">'
                    + '<div class="dot-title">' + dot.title + '</div>'
                    + dot.shortText
                + '</div>'
        );
        dotsReady.push(marker);
    }

    // append markers array to map
    initialize();

    function initialize() {
        var mapMinZoom = 4;
        var mapMaxZoom = 5;

        // add markers to map
        map = L.map('map', {
            layers: dotsReady
        }).setView([70, 10], 5);

        // map draggable area
        map.setMaxBounds([[5, -180], [122, 100]]);

        // map size
        var mapBounds = new L.LatLngBounds(
            map.unproject([0, 4000], mapMaxZoom),
            map.unproject([6400, 0], mapMaxZoom));

        L.tileLayer('tiles/{z}/{x}/{y}.png', {
            minZoom: mapMinZoom,
            maxZoom: mapMaxZoom,
            bounds: mapBounds,
            noWrap: true
        }).addTo(map);
    }

    // response
//    socket.emit('my other event', { my: 'data' });
});



// add marker
//var setMarkerButton = document.querySelector("#setMarker");
//var setMarkerStatus = true;
//
//setMarkerButton.addEventListener("click", function(e) {
//	this.setAttribute("disabled", "disabled");
//	setMarkerStatus = false;
//	console.log("please set the marker");
//});
//
//map.addEventListener("click", function(e) {
//	if (!setMarkerStatus) {
//		L.marker([e.latlng.lat, e.latlng.lng]).bindPopup('This is Sparta.').addTo(map);
//		setMarkerStatus = true;
//		setMarkerButton.removeAttribute("disabled");
//		console.log("okay. marker has been setted");
//	}
//});