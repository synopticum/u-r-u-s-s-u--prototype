module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
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
                ],
                dest: 'build/js/plugins.js'
            }
        },

        uglify: {
            options: {
                stripBanners: true,
                banner: '/* <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },

            build: {
                src: 'build/js/plugins.js',
                dest: 'build/js/plugins.min.js'
            }
        },

        cssmin: {
            with_banner: {
                options: {
                    banner: '/* minified css*/'
                },

                files: {
                    'build/css/plugins.css' : [
                        'libs/jquery-ui/jquery-ui.css',
                        'libs/leaflet/leaflet.css',
                        'libs/fancybox/jquery.fancybox.css',
                        'libs/selectbox/jquery.selectbox.css'
                    ]
                }
            }
        },

        watch: {
            scripts: {
                files: ['libs/*.js'],
                tasks: ['concat', 'uglify', 'removelogging']
            },
            css: {
                files: ['libs/*.css'],
                tasks: ['cssmin']
            }
        },

        removelogging: {
            dist: {
                src: "build/build.min.js",
                dest: "build/build.clean.js"
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-remove-logging');

    grunt.registerTask('default', ['concat', 'uglify', 'cssmin', 'removelogging', 'watch']);
    grunt.registerTask('test', ['']);
};