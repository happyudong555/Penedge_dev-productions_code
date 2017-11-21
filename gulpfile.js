var gulp = require('gulp');
var uglify = require('gulp-uglify');
var pump = require('pump');
var minifyCSS = require('gulp-minify-css');
var htmlmin = require('gulp-htmlmin');

// minify javascript inside javascript folders

gulp.task('minify-js', function (cb) {
  pump([
        gulp.src('js/*.js'),
        uglify(),
        gulp.dest('js')
    ],
    cb
  );
});

// minify javascript inside controller folders

gulp.task('minify-controller', function (cb) {
  pump([
        gulp.src('Controllers/*.js'),
        uglify(),
        gulp.dest('Controllers')
    ],
    cb
  );
});

// minify css inside css folders

gulp.task('minify-css', function (cb) {
  pump([
        gulp.src('css/*.css'),
        minifyCSS(),
        gulp.dest('css')
    ],
    cb
  );
});

// minify html outside folders

gulp.task('minify-html', function() {
  return gulp.src('*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(''));
});