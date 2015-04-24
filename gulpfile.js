var gulp = require('gulp'),
    browserify = require('browserify'),
    watchify = require('watchify'),
    source = require('vinyl-source-stream'),
    browserSync = require('browser-sync').create(),
    nodemon = require('gulp-nodemon'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    babelify = require('babelify'),
    reload = browserSync.reload;

var path = {
  app: "./src/js/client/app.js",
  html: "src/html/index.html",
  build: "public/build",
  pub: "public/",
  server: "src/js/server/index.js",
  sass: "src/scss/**/*.scss",
  css: "public/css"
};

gulp.task('default', ['browser-sync']);

gulp.task('copyHtml', function() {
  gulp.src(path.html)
      .pipe(gulp.dest(path.pub));
});

// Runs all static source file updates (besides browserify)
gulp.task('static', ['copyHtml', 'sass']);

// proxy requests thru browser-sync for reloads
gulp.task('browser-sync', ['server'], function() {
  browserSync.init({
    proxy: "hashchat.dev:8080"
  });
});

gulp.task('sass', function() {
  gulp.src(path.sass)
      .pipe(sass())
      .pipe(gulp.dest(path.css))
      .pipe(reload({stream: true}));
});

// autorun all build tasks and trigger browser-sync reloads
gulp.task('watch', ['static', 'browserify'], function() {
  gulp.watch(path.html, ['copyHtml'])
      .on('change', reload);
  gulp.watch(path.build + '**/*.*')
      .on('change', reload);
  gulp.watch(path.sass, ['sass']);
});

// starts the web server and watches for file changes
// triggers browser-sync reload on start
gulp.task('server', ['watch'], function() {
  nodemon({
    script: path.server,
    watch: [path.server]
  }).on('start', reload);
});

// recompiles the clientside browserified js with reactify transform on changes
gulp.task('browserify', function() {
  var watcher = watchify(browserify({
    entries: [path.app],
    transform: [babelify],
    debug: true,
    cache: {}, packageCache: {}, fullPaths: true
  }));

  bundle(watcher);

  return watcher.on('update', function() {
    console.log('browserify: updated');
    bundle(watcher);
  });
});

function bundle(b) {
  return b.bundle()
          // catch transform errors and end current pipe w/o crashing
          .on('error', function(err) {
            console.log(err.message);
            console.log('error');
            this.emit('end');
          })
          .pipe(source(path.app))
          .pipe(rename('app.js'))
          .pipe(gulp.dest(path.build));
}