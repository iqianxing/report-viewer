var gulp = require('gulp');

gulp.task('default',function (done) {
  gulp.src(["ngapp/*.js","ngapp/*.css","ngapp/*.map"])
  .pipe(gulp.dest("public/report/"));

  done()
})