var exports = this;

(function ($) {
    var mod = {};

    mod.create = function (includes) {
        var result = function () {
            this.init.apply(this, arguments);
        };
        result.fn = result.prototype;
        result.fn.init = function () {};

        result.proxy = function (func) { return $.proxy(func, this); };
        result.fn.proxy = result.proxy;

        result.include = function (obj) { $.extend(this.fn, obj); };
        result.extend = function (obj) { $.extend(this, obj); };
        if (includes) result.include(includes);

        return result;
    };

    mod.addMapEvents = function () {
        map.on('click', mod.setMarker);
        map.on('load', mod.hideLoadScreen);
    };

    mod.setMarker = function (e) {
        var popup = $('#placeDot');
        $.fancybox.open(popup);
        $('.input-position', popup).val([e.latlng.lat+0.15, e.latlng.lng+0.1]).attr('disabled', 'disabled');
    };

    mod.hideLoadScreen = $('#clouds').fadeOut(2000);

    // events:
    // add marker popup
    $('#placeDot form').on('submit', function () { return false; });

    $('#placeDot').find('.input-submit').on('click', function () {
        var that = $('#placeDot');

        that.position    = $(".input-position", that).val().split(',');
        that.title       = $(".input-title", that).val();
        that.shortText   = $(".input-short-text", that).val();
        that.image       = $(".input-image", that).val();
        that.icon        = $(".input-icon", that).val();
        that.address     = $(".input-address", that).val();
        that.homePhone   = $(".input-home-phone", that).val();
        that.mobilePhone = $(".input-mobile-phone", that).val();

        var dot = Dots.init();
        dot.id          = helper.guid();
        dot.template    = null;
        dot.byUser      = null;
        dot.position    = that.position;
        dot.title       = that.title;
        dot.shortText   = that.shortText;
        dot.image       = that.image;
        dot.icon        = that.icon;
        dot.address     = that.address;
        dot.homePhone   = that.homePhone;
        dot.mobilePhone = that.mobilePhone;

        dot.create();

        L.marker(dot.position, { icon: dot.getIcon() }).bindPopup(View.dot(dot)).addTo(map);

        $.fancybox.close(that);
    });

    // plugins
    $('.fancybox').fancybox();
    $(".selectbox").selectbox();

    // exports
    exports.Controller = mod;
})(jQuery);