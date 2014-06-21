var map;
var dots = []; // markers array
var socket = io('http://localhost');

/* map loading bar */
$(window).load(function(){
    $('#clouds').fadeOut(2000);
});

/* marker icon settings */
var LeafIcon = L.Icon.extend({
    options: {
        iconSize:     [39, 48]
    }
});

var pathToIcons = 'js/leaflet/images/markers/';

var dotIcons = {
    red   : new LeafIcon({iconUrl: pathToIcons + 'marker-icon.png'}),
    blue  : new LeafIcon({iconUrl: pathToIcons + 'marker-icon.png'}),
    green : new LeafIcon({iconUrl: pathToIcons + 'marker-icon.png'})
};

var getDotIcon = function(iconString) {
    switch (iconString) {
    case "red" :
        return dotIcons.red;
        break;
    case "blue" :
        return dotIcons.blue;
        break;
    case "green" :
        return dotIcons.green;
        break;
    default :
        return dotIcons.red;
        break;
    }
};

/* map initialize */
socket.on('news', function (data) {
    // creating markers array
    data = JSON.parse(data);
    for (var item in data) {
        var dot = data[item];

        dot.id = Number(dot.id);
        dot.byUser = Boolean(dot.byUser);
        dot.icon = getDotIcon(dot.icon);
        console.log(dot.id);

        var realDot = L.marker(dot.position, { icon: dot.icon }).bindPopup(
                '<div class="dot-title">' + dot.title + '</div>' +
                '<div class="dot-short-text">' + dot.shortText + '</div>'
        );
        dots.push(realDot);
    }

    // append markers array to map
    initialize();

    function initialize() {
        var mapMinZoom = 4;
        var mapMaxZoom = 5;

        // add markers to map
        map = L.map('map', {
            layers: dots
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
    socket.emit('my other event', { my: 'data' });
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