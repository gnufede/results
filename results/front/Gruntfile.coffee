module.exports = (grunt) ->
    externalSources = [
        'bower_components/angular/angular.js',
        'bower_components/lodash/dist/lodash.js',
        'bower_components/angular-resource/angular-resource.js',
        'bower_components/angular-cookies/angular-cookies.js',
        'bower_components/angular-sanitize/angular-sanitize.js',
        'bower_components/angular-route/angular-route.js',
        'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
    ]

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        less: {
            development: {
                options: {
                    paths: ['../static/css']
                },
                files: {
                    "../static/css/main.css": "app/less/*/*.less"
                }
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                mangle: true,
                report: 'min'
            },

            libs: {
                dest: "../static/js/libs.js",
                src: externalSources
            },

            app: {
                dest: "../static/js/app.js",
                src: ["../static/js/_app.js"]
            }
        },

        coffee: {
            dev: {
                options: {join: false},
                files: {
                    "../static/js/app.js": [
                        "app/coffee/**/*.coffee"
                        "app/coffee/*.coffee"
                    ]
                }
            },

            pro: {
                options: {join: false},
                files: {"../static/js/_app.js": ["app/coffee/**/*.coffee"]}
            }
        },

        concat: {
            options: {
                separator: ';',
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                        '<%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },

            libs: {
                dest: "../static/js/libs.js",
                src: externalSources
            }
        },

        watch: {
            less: {
                files: ['app/less/**/*.less'],
                tasks: ['less']
            },

            coffee: {
                files: ['app/coffee/**/*.coffee'],
                tasks: ['coffee:dev']
            },

            libs: {
                files: externalSources,
                tasks: ["concat"],
            }
        },

        connect: {
            devserver: {
                options: {
                    port: 9001,
                    base: 'app'
                }
            },

            proserver: {
                options: {
                    port: 9001,
                    base: 'app',
                    keepalive: true
                }
            }
        },

        #htmlmin: {
        #    dist: {
        #        options: {
        #            removeComments: true,
        #            collapseWhitespace: true
        #        },
        #        files: {
        #            'templates/index.html': 'templates/index.template.html'
        #        }
        #    }
        #},
    })

    grunt.loadNpmTasks('grunt-contrib-uglify')
    grunt.loadNpmTasks('grunt-contrib-concat')
    grunt.loadNpmTasks('grunt-contrib-less')
    grunt.loadNpmTasks('grunt-contrib-watch')
    grunt.loadNpmTasks('grunt-contrib-connect')
    grunt.loadNpmTasks('grunt-contrib-jshint')
    #grunt.loadNpmTasks('grunt-contrib-htmlmin')
    grunt.loadNpmTasks('grunt-contrib-coffee')

    grunt.registerTask('pro', [
        'less',
        'coffee:pro',
        'uglify',
    #    'htmlmin',
    ])

    grunt.registerTask('dev', [
        'less',
        'coffee:dev',
        'concat:libs',
    #    'htmlmin',
    ])

    grunt.registerTask('default', [
        'dev',
        'connect:devserver',
        'watch'
    ])
