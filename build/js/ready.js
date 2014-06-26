$(document).ready(function () {
    $('.fancybox').fancybox();
    $(".selectbox").selectbox();

    $('#placeDot form').on('submit', function () { return false; });

    $('#placeDotSubmit').on('click', function () {
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
            dot.id          = Math.guid();
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
});