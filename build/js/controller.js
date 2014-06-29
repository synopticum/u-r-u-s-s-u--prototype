var exports = this;

(function ($) {
    var mod = {};

    mod.addMapEvents = function () {
        map.on('load', mod.hideLoadScreen);

        map.on('click', mod.setMarker);

        map.on('popupopen', function (e) {
            console.log($(this));
            $(this._popup._wrapper).find('.dot-title').click(function () {
                alert('clicked');
            })
        });
    };

    mod.setMarker = function (e) {
        var popup = $('#placeDot');
        $.fancybox.open(popup);
        $('.input-position', popup).val([e.latlng.lat+0.15, e.latlng.lng+0.1]).attr('disabled', 'disabled');
        $('.input-title, .input-short-text, .input-image, .input-address, .input-address, .input-home-phone, .input-mobile-phone').val('');
    };

    mod.hideLoadScreen = $('#clouds').fadeOut(2000);

    // select marker popup:
    $('#selectMarker').on('click', function () {
        $('#selectMarkerPopup').fadeIn('fast');
        e.preventDefault();
    });

    $('#selectMarkerPopup input').on('click', function () {
        $('#selectMarkerPopup').fadeOut('fast');
        $('#selectMarker').val($(this).val());
    });

    // add marker popup
    $('#placeDot').find('.input-submit').on('click', function () {
        var that = $('#placeDot');

        that.position    = $(".input-position", that).val().split(',');
        that.layer       = $(".input-layer", that).val();
        that.title       = $(".input-title", that).val();
        that.text        = $(".input-short-text", that).val();
        that.image       = $(".input-image", that).val();
        that.icon        = $("input[name='markerset']:checked", that).val();
        that.address     = $(".input-address", that).val();
        that.street      = $(".input-street", that).val();
        that.house       = $(".input-house", that).val();
        that.homePhone   = $(".input-home-phone", that).val();
        that.mobilePhone = $(".input-mobile-phone", that).val();

        var dot = new BDot({
            id          : helper.guid(),
            template    : null,
            byUser      : null,
            layer       : that.layer,
            position    : that.position,
            title       : that.title || "default title",
            text        : that.text || "default description",
            image       : that.image || new BDot().defaultImage,
            icon        : that.icon,
            address     : that.address || "dst.",
            street      : that.street || "Default Street",
            house       : that.house || "666",
            homePhone   : that.homePhone || "default phone",
            mobilePhone : that.mobilePhone || "default mobile",
            gallery     : [] || null
        });
        if (BDots.records) {
            console.log(that.layer);
            BDots.records.add(dot);
            dot.save(null, {
                success: function(model, response){
                    console.log('dot created on server!!');
                    console.log(response);
                },
                error: function(model, response){
                    console.log('creation server error!');
                    console.log(response);
                }});
        }
        else throw Error('BDots.records don t exist');

        var view = new UserView();
        L.marker(dot.attributes.position, { icon: dot.getIcon() }).bindPopup(view.template(dot.attributes)).addTo(map);

        $.fancybox.close(that);
    });

    // plugins
    $('.fancybox').fancybox();
    $(".selectbox").selectbox();
    $( ".markerset" ).buttonset();

    // exports
    exports.Controller = mod;
})(jQuery);