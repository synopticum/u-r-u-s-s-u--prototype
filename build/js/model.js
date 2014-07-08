var BDot = Backbone.Model.extend({
    urlRoot : '/dot',
    sync: function(method, fd, options){
        return $.ajax({
            url: '/dot',
            data: fd,
            contentType: false,
            processData: false,
            type: method,
            success: options.success,
            error:   options.error
        });
    },
    destroy: function(id, options){
        return $.ajax({
            url: '/dot',
            data: id,
            contentType: 'text/plain',
            processData: false,
            type: 'DELETE',
            success: options.success,
            error:   options.error
        });
    },
    getIcon: function () {
        switch (this.attributes.icon) {
            case "pink" :
                return new LeafIcon({iconUrl: 'js/leaflet/images/markers/marker-icon-pink.png'});
                break;
            case "blue" :
                return new LeafIcon({iconUrl: 'js/leaflet/images/markers/marker-icon-blue.png'});
                break;
            case "green" :
                return new LeafIcon({iconUrl: 'js/leaflet/images/markers/marker-icon-green.png'});
                break;
            case "graypink" :
                return new LeafIcon({iconUrl: 'js/leaflet/images/markers/marker-icon-g-pink.png'});
                break;
            case "grayblue" :
                return new LeafIcon({iconUrl: 'js/leaflet/images/markers/marker-icon-g-blue.png'});
                break;
            case "graygreen" :
                return new LeafIcon({iconUrl: 'js/leaflet/images/markers/marker-icon-g-green.png'});
                break;
            case "vertical-pink" :
                return new LeafIcon({iconUrl: 'js/leaflet/images/markers/marker-icon-a-pink.png'});
                break;
            case "vertical-blue" :
                return new LeafIcon({iconUrl: 'js/leaflet/images/markers/marker-icon-a-blue.png'});
                break;
            case "vertical-green" :
                return new LeafIcon({iconUrl: 'js/leaflet/images/markers/marker-icon-a-green.png'});
                break;
            case "message-green" :
                return new LeafIcon({iconUrl: 'js/leaflet/images/markers/marker-icon-m-green.png'});
                break;
            case "message-pink" :
                return new LeafIcon({iconUrl: 'js/leaflet/images/markers/marker-icon-m-pink.png'});
                break;
            case "message-blue" :
                return new LeafIcon({iconUrl: 'js/leaflet/images/markers/marker-icon-m-blue.png'});
                break;
            case "flag-green" :
                return new LeafIcon({iconUrl: 'js/leaflet/images/markers/marker-icon-f-green.png'});
                break;
            case "flag-pink" :
                return new LeafIcon({iconUrl: 'js/leaflet/images/markers/marker-icon-f-pink.png'});
                break;
            case "flag-blue" :
                return new LeafIcon({iconUrl: 'js/leaflet/images/markers/marker-icon-f-blue.png'});
                break;
            case "gold" :
                return new LeafIcon({iconUrl: 'js/leaflet/images/markers/marker-icon-gold.png'});
                break;
            default :
                return new LeafIcon({iconUrl: 'js/leaflet/images/markers/marker-icon-green.png'});
                break;
        }
    }
});

// Main Model
var BDots;
var BMessages;
var BNews;
var BAds;
var BAnonymous;

var BDotsModel = Backbone.Model.extend({
    records: new Backbone.Collection(),
    layers: {},
    initialize: function (data) {
        /* create dots records */
        for (var jsonItem in data) {
            var model = new BDot(data[jsonItem]);
            var view = new View.ShowDot();

            model.attributes.marker = L.marker(model.attributes.position, { icon: model.getIcon() })
                .bindPopup(view.template(model.attributes));

            delete model.attributes._id;
            delete model.attributes.__v;

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

        // update
        setInterval(function() {
            BDots.records.fetch({ url : "/dots" });
            BMessages.records.fetch({ url : "/messages" });
            BNews.records.fetch({ url : "/news" });
            BAds.records.fetch({ url : "/ads" });
            BAnonymous.records.fetch({ url : "/anonymous" });
        }, 10000);
    }
});

var BMessagesModel = Backbone.Model.extend({
    records: new Backbone.Collection(),
    initialize: function (data) {
        for (var jsonItem in data) {
            var message = data[jsonItem];
            delete message._id;
            delete message.__v;

            this.records.add(message);
        }
    }
});

var BNewsModel = Backbone.Model.extend({
    records: new Backbone.Collection(),
    initialize: function (data) {
        for (var jsonItem in data) {
            var message = data[jsonItem];
            delete message._id;
            delete message.__v;

            this.records.add(message);
        }
    }
});

var BAdsModel = Backbone.Model.extend({
    records: new Backbone.Collection(),
    initialize: function (data) {
        for (var jsonItem in data) {
            var message = data[jsonItem];
            delete message._id;
            delete message.__v;

            this.records.add(message);
        }
    }
});

var BAnonymousModel = Backbone.Model.extend({
    records: new Backbone.Collection(),
    initialize: function (data) {
        for (var jsonItem in data) {
            var message = data[jsonItem];
            delete message._id;
            delete message.__v;

            this.records.add(message);
        }
    }
});