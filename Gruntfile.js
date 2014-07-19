module.exports = function (grunt) {
    //описываем конфигурацию
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'), //подгружаем package.json, чтобы использовать его данные

        concat: {  //описываем работу плагина конкатенации
            dist: {
                src: [
                    'libs/vendor/jquery.min.js',
                    'libs/vendor/underscore-min.js',
                    'libs/vendor/backbone-min.js',
                    'libs/jquery-ui/jquery-ui.min.js',
                    'libs/leaflet/leaflet.js',
                    'libs/fancybox/jquery.fancybox.js',
                    'libs/selectbox/jquery.selectbox-0.2.min.js',
                    'libs/inputmask/jquery.inputmask.js'
                ],  // какие файлы конкатенировать
                dest: 'build/js/plugins.js'  // куда класть файл, который получиться после процесса конкатенации
            }
        },

        uglify: {  //описываем работу плагина минификации js - uglify.
            options: {
                stripBanners: true,
                banner: '/* <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n' //комментарий который будет в минифицированном файле.
            },

            build: {
                src: 'build/js/plugins.js',  // какой файл минифицировать
                dest: 'build/js/plugins.min.js' // куда класть файл, который получиться после процесса минификации
            }
        },

        cssmin: { //описываем работу плагина минификации и конкатенации css.
            with_banner: {
                options: {
                    banner: '/* minified css*/'  //комментарий который будет в output файле.
                },

                files: {
                    'build/css/plugins.css' : [
                        'libs/jquery-ui/jquery-ui.css',
                        'libs/leaflet/leaflet.css',
                        'libs/fancybox/jquery.fancybox.css',
                        'libs/selectbox/jquery.selectbox.css'
                    ]   // первая строка - output файл. массив из строк, какие файлы конкатенировать и минифицировать.
                }
            }
        },

        watch: { //описываем работу плагина слежки за файлами.
            scripts: {
                files: ['libs/*.js'],  //следить за всеми js файлами в папке src
                tasks: ['concat', 'uglify', 'removelogging']  //при их изменении запускать следующие задачи
            },
            css: {
                files: ['libs/*.css'], //следить за всеми css файлами в папке src
                tasks: ['cssmin'] //при их изменении запускать следующую задачу
            }
        },

        removelogging: { //описываем работу плагина удаления логов
            dist: {
                src: "build/build.min.js", // файл который надо отчистить от console.log
                dest: "build/build.clean.js" // выходной файл, который получим после очистки
            }
        }
    });

    //подгружаем необходимые плагины
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-remove-logging');

    //регистрируем задачу
    grunt.registerTask('default', ['concat', 'uglify', 'cssmin', 'removelogging', 'watch']); //задача по умолчанию, просто grunt
    grunt.registerTask('test', ['']); //пока пусто, но кто знает, возможно в следующих уроках мы этим воспользуемся <img src="http://loftblog.ru/wp-includes/images/smilies/icon_smile.gif" alt=":)" class="wp-smiley">
};