var gulp = require('gulp');
	screeps = require('gulp-screeps'),
	watch = require('gulp-watch'),
	credentials = require('./credentials.js');
 
gulp.task('screeps', function() {
	gulp.src('dist/*.js')
		.pipe(screeps(credentials));
});

gulp.task('default', ['screeps'], function(){
	gulp.watch("dist/*.js", ['screeps']);
});