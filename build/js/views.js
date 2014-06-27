var UserView = Backbone.View.extend({
    template: _.template($('#dot-popup-template').html()),
    render: function() {
        this.$el.html(this.template(this.model.attributes));
        return this;
    },
    events: {
        "click"                : "open",
        "click .icon.doc"         : "select",
        "contextmenu .icon.doc"   : "showMenu",
        "click .show_notes"       : "toggleNotes",
        "click .title .lock"      : "editAccessLevel",
        "mouseover .title .date"  : "showTooltip"
    },
    open: function() {
        window.open(this.model.get("viewer_url"));
    }
});