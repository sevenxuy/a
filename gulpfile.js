var gulp = require('gulp'),
  connect = require('gulp-connect'),
  livereload = require('gulp-livereload'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  rjs = require('requirejs');


gulp.task('rjs', function() {
  rjs.optimize({
    baseUrl: 'src/js/app',
    out: 'src/dest/cs.js',
    mainConfigFile: 'src/js/app/main.js',
    include: ['src/js/lib/almond.js'],
    optimize: 'uglify'
  });
});

gulp.task('watch', function() {
  gulp.watch(['./src/css/*.css'], ['css']);
  // gulp.watch(['./src/js/app/*.js'], ['rjs']);
});

gulp.task('connect', function() {
  connect.server({
    root: ['src'],
    host: 'localhost',
    port: 8111,
    livereload: true
  });
});

gulp.task('default', ['connect']);
