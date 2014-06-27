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

        var dot = new BDot({
            id          : helper.guid(),
            template    : null,
            byUser      : null,
            position    : that.position,
            title       : that.title || "default title",
            shortText   : that.shortText || "default description",
            image       : that.image || new BDot().defaultImage,
            icon        : that.icon,
            address     : that.address || "dst.",
            street      : that.address || "Defeult Street",
            house       : that.address || "666",
            homePhone   : that.homePhone || "default phone",
            mobilePhone : that.mobilePhone || "default mobile"
        });
        if (BDots.records) {
            BDots.records.add(dot);
        }
        else throw Error('BDots.records dont exist');

        L.marker(dot.attributes.position, { icon: dot.getIcon() }).bindPopup(View.dot(dot)).addTo(map);

        $.fancybox.close(that);
    });

    // plugins
    $('.fancybox').fancybox();
    $(".selectbox").selectbox();

    // exports
    exports.Controller = mod;
})(jQuery);