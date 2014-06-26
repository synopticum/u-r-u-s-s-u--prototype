var View = {
    dot : function (dot) {
        var dotResult = $('<div/>');

        $(dotResult).loadTemplate($("#dot-template"),
            {
                'id'           : dot.id,
                'image'        : dot.getImage(),
                'title'        : dot.title,
                'text'         : dot.text,
                'address'      : dot.address + ' ' + dot.street + ' ' + dot.house + ' ',
                'home-phone'   : dot.homePhone,
                'mobile-phone' : dot.mobilePhone,
                'gallery'      : dot.gallery
            });

        return dotResult.get(0);
    }
};