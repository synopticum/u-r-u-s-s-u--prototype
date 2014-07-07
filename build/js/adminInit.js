View.map = {
    init: function (showAll) {
        var mapMinZoom = 4;
        var mapMaxZoom = 5;

        var mainLayer = L.layerGroup(BDots.layers.main);
        var oldLayer = L.layerGroup(BDots.layers.old);
        var placesLayer = L.layerGroup(BDots.layers.user);
        var eventsLayer = L.layerGroup(BDots.layers.events);

        var userApprovedLayer = L.layerGroup(BDots.layers.usermain);
        var userPlacesLayer = L.layerGroup(BDots.layers.userplaces);
        var userEventsLayer = L.layerGroup(BDots.layers.userevents);

        var layersArray = [
            mainLayer,            // main layer
            oldLayer,             // old photos
            placesLayer,          // user dot approved
            eventsLayer,          // user event approved
            userApprovedLayer,    // user dot for mainLayer, don't approved
            userPlacesLayer,      // user dot for userLayer, don't approved
            userEventsLayer       // user dot for eventsLayer, don't approved
        ];

        var staticLayers = {
            "Общая карта": mainLayer
        };

        var dynamicLayers = {
            "Старые виды": oldLayer,
            "Места": placesLayer,
            "События": eventsLayer,
            "User: Общая карта": userApprovedLayer,
            "User: Места": userPlacesLayer,
            "User: События": userEventsLayer
        };

        map = L.map('map', { layers: layersArray });

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

        map.on('load', $('#clouds').fadeOut(2000));
        map.on('load', View.map.showStartScreen());

        // admin controls
        $('#messagesmod').on('click', function () {
            var view = new View.messagesMod();
            $.fancybox.open(view.render());
        });

        // set dot
        map.on('dblclick', function (position) {
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

            $(this._popup._wrapper).find('.dot-messages').click(function () {
                var view = new View.messagesDot({ dotId: popupId });
                $.fancybox.open(view.render());
            });

            $('.fancybox').fancybox();
        });
    },
    showStartScreen : function () {
        // show start view
        var view = new View.startScreen();
        $.fancybox.open(view.render());
        $("#startScreen").tabs();
    }
};

View.messagesDot = Backbone.View.extend({
    dot: null,
    dotId: null,
    initialize: function (obj) {
        this.dotId = obj.dotId;
        this.dot = BDots.records.get(this.dotId).attributes;

        // dot messages search
        var messagesFound = BMessages.records.where({ dotId: this.dotId });
        messagesFound = JSON.stringify(messagesFound);
        this.dot.messages = JSON.parse(messagesFound);
    },
    id: 'messagesdot-popup',
    className: 'popup',
    template: _.template($('#messagesdot-popup-template').html()),
    render: function() {
        return this.$el.html(this.template(this.dot));
    },
    events: {
        'click .input-submit': 'submit'
    },
    'submit': function() {
        var _this = $(this.$el);
        var message = {
            id: this.dotId,
            text: $('.popup-textarea' ,_this).val()
        };

        $.post('/messages', message, { success: function (res) {
            console.log('message added')
        }, error: function () {
            console.log(res)
        } });

        $.fancybox.close(_this);
        helper.status('Сообщение отправлено');
    }
});

View.messagesMod = Backbone.View.extend({
    messages: {},
    initialize: function (obj) {
        var messages = JSON.stringify(BMessages.records.where({ approved : false }));
        this.messages = JSON.parse(messages);
    },
    id: 'messagesdot-popup',
    className: 'popup',
    template: _.template($('#messagesmod-popup-template').html()),
    render: function() {
        return this.$el.html(this.template(this));
    },
    events: {
        'click .input-submit': 'submit'
    },
    'submit': function() {
        var _this = $(this.$el);

        $.fancybox.close(_this);
        helper.status('Сообщение отправлено');
    }
});

$.getJSON("/dots", function (data) {
    BDots = new BDotsModel(data);
    View.map.init();
});

$.getJSON("/messages", function (data) {
    BMessages = new BMessagesModel(data);
});