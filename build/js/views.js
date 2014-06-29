var UserView = Backbone.View.extend({
    initialize: function () {
//        console.log('init')
    },
    template: _.template($('#dot-popup-template').html()),
    events: {
        "click .dot-title": "open"
    },
    open: function() {
        console.log('clicked');
    }
});