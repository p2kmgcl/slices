var gulp        = require('gulp'),
    browserSync = require('browser-sync').create(),
    vulcanize   = require('gulp-vulcanize');

gulp.task('default', [
    'build',
    'serve'
]);

gulp.task('build', function () {
    gulp.src('src/index.html')
    .pipe(vulcanize({
        inlineScripts: true,
        inlineCss: true
    }))
    .pipe(gulp.dest('.tmp'))
    .on('data', function () {
        gulp.src(['.tmp/index.html'])
        .pipe(browserSync.stream());
    });
});

gulp.task('serve', function () {
    browserSync.init({
        server: './.tmp',
        port: 8080
    });
    gulp.watch('src/**/*', ['build']);
});
