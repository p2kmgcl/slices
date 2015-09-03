gulp        = require 'gulp'
browserSync = require('browser-sync').create()
coffee      = require 'gulp-coffee'
concat      = require 'gulp-concat'
jade        = require 'gulp-jade'
sass        = require 'gulp-sass'

gulp.task 'default', [
    'coffee'
    'jade'
    'sass'
    'serve'
]

gulp.task 'coffee', ->
    gulp.src 'app/main.coffee'
    .pipe coffee()
    .pipe gulp.dest '.tmp/'
    .on 'data', ->
        gulp.src [
            'bower_components/randomcolor/randomColor.js'
            'bower_components/Autolinker.js/dist/Autolinker.js'
            'bower_components/codebird/codebird.js'
            'bower_components/minigrid/minigrid.min.js'
            '.tmp/main.js'
        ]
        .pipe concat 'main.js'
        .pipe gulp.dest '.tmp/'
        .pipe browserSync.stream()
    
gulp.task 'jade', ->
    gulp.src 'app/index.jade'
    .pipe jade()
    .pipe gulp.dest '.tmp/'
    .pipe browserSync.stream()

gulp.task 'sass', ->
    gulp.src 'app/main.sass'
    .pipe sass()
    .pipe gulp.dest '.tmp/'
    .pipe browserSync.stream()

gulp.task 'serve', ->
    browserSync.init
        server: './.tmp'
        port: 8080
    
    gulp.watch 'app/main.coffee', ['coffee']
    gulp.watch 'app/index.jade', ['jade']
    gulp.watch 'app/main.sass', ['sass']
