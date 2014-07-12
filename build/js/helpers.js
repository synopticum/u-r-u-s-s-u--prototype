var helper = {
    // id generator
    guid : function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
        function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        }).toUpperCase();
    },
    status: function (text) {
        $('#status span').text(text);
        $('#status').fadeIn('slow').fadeOut('slow');
    },
    anonymousRandom: function () {
        var items = [
            'Мы следим за тобой, ничтожество.',
            'Если у вас нет паранойи, это еще не значит, что за вами не следят.',
            'На конференцию параноиков никто не приехал.',
            'Параноики живут дольше всех.',
            'Он разместил на Google Maps несколько фальшивых объявлений, указав адреса ФБР и Секретной службы США, но свои собственные номера телефонов. Когда люди звонили по этим номерам, Брайан направлял звонок на настоящие номера спецслужб — и включал аудиозапись.',
            'Вас снимает скрытая камера.',
            'Спустя пятьдесят лет после самоубийства, на основании Закона о свободе информации, в ФБР был сделан запрос об Эрнесте Хемингуэе.\<br\> Ответ: слежка была, жучки были, прослушка была даже в психиатрической клинике, откуда он звонил, чтобы сообщить об этом.',
            'В июне 2013 года Эдвард Сноуден раскрыл факт всеобъемлющего слежения в 60 странах\<br\> за более чем миллиардом человек, правительствами 35 стран.',
            'Тестирование популярных моделей шапочек из фольги показало, что они вовсе не экранируют сигнал, а могут даже его усиливать.',
            'Мы идём, летим, плывём, наше имя &mdash; Легион.'
        ];
        return items[Math.floor(Math.random()*items.length)];
    },
    singleImageUpload: function () {
        var _this = $(this.$el);
        $('#fileupload').fadeIn();

        // create FormData Object with files/json
        var fd = new FormData();

        var file_data = $('.input-file', _this)[0].files;

        for (var i = 0; i < file_data.length; i++) {
            fd.append("image", file_data[i]);
        }

        var self = this;
        $.ajax({
            url: '/uploads',
            data: fd,
            contentType: false,
            processData: false,
            type: 'post',
            success: function (e) {
                self.image = e;
                $('#fileupload').fadeOut();
            },
            error:   function (e) {
                alert(e.responseText);
                $('#fileupload').fadeOut();
                $('.input-file').val('');
            }
        });
    },
    markerImageUpload: function () {
        var _this = $(this.$el);
        $('#fileupload').fadeIn();

        // create FormData Object with files/json
        var fd = new FormData();

        var file_data = $('.input-file', _this)[0].files;

        for (var i = 0; i < file_data.length; i++) {
            fd.append("image", file_data[i]);
        }

        var self = this;
        $.ajax({
            url: '/uploadmarker',
            data: fd,
            contentType: false,
            processData: false,
            type: 'post',
            success: function (e) {
                self.image = e;
                $('#fileupload').fadeOut();
            },
            error:   function (e) {
                alert(e.responseText);
                $('#fileupload').fadeOut();
                $('.input-file').val('');
            }
        });
    },
    galleryUpload: function () {
        var _this = $(this.$el);
        $('#fileupload').fadeIn();

        // create FormData Object with files/json
        var fd = new FormData();

        var file_data = $('.input-gallery', _this)[0].files;

        for (var i = 0; i < file_data.length; i++) {
            fd.append("galleryImages", file_data[i]);
        }

        var self = this;
        $.ajax({
            url: '/uploadgallery',
            data: fd,
            contentType: false,
            processData: false,
            type: 'post',
            success: function (e) {
                self.gallery = JSON.parse(e);
                $('#fileupload').fadeOut();
            },
            error:   function (e) {
                alert(e.responseText);
                $('#fileupload').fadeOut();
                $('.input-gallery').val('');
            }
        });
    },
    singleImage: function (e) {
        var image = $(this).attr('href');
        $('#singleimage').addClass('active').append('<img src="' + image + '"/>').append('<span class="close"/>');

        $('#singleimage .close').click(function () {
            $('#singleimage img, #singleimage .close').remove();
            $('#singleimage').removeClass('active');
        });

        e.preventDefault();
    },
    playSend: function () {
        var click = document.createElement('audio');
        $(click).attr('src', '/sounds/send.mp3');
        click.play();
    },
    playClick: function () {
        var click = document.createElement('audio');
        $(click).attr('src', '/sounds/click.mp3');
        click.play();
    },
    disableInputs: function () {
        $('.popup-textarea').attr('disabled', 'disabled').val('');
        $('.input-submit').attr('disabled', 'disabled').addClass('popup-button-disabled');
    }
};