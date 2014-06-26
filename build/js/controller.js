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

    mod.addEvents = function () {
        map.on('click', mod.setMarker);
        map.on('load', mod.hideLoadScreen);
    };

    mod.setMarker = function (e) {
        var popup = $('#placeDot');
        $.fancybox.open(popup);
        $('.input-position', popup).val([e.latlng.lat+0.15, e.latlng.lng+0.1]).attr('disabled', 'disabled');
    };

    mod.hideLoadScreen = $('#clouds').fadeOut(2000);

    // exports
    exports.Controller = mod;
})(jQuery);