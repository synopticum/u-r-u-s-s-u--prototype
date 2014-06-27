var View = {
    dot : function (dot) {
        var dotResult = $('<div/>');
        var gallery = $('<div class="dot-gallery"/>');

        $(dotResult).loadTemplate($("#dot-template"),
            {
                'id'           : dot.attributes.id,
                'image'        : dot.getImage(),
                'gallery-link' : '/gallery/' + dot.attributes.id + '/1.jpg',
                'title'        : dot.attributes.title,
                'text'         : dot.attributes.text,
                'address'      : dot.attributes.address + ' ' + dot.attributes.street + ' ' + dot.attributes.house,
                'home-phone'   : dot.attributes.homePhone,
                'mobile-phone' : dot.attributes.mobilePhone
            });

        $(gallery).loadTemplate($("#gallery-links-template"), dot.attributes.gallery);
        $(dotResult).append(gallery);

        return dotResult.get(0);
    }
};