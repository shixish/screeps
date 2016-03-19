var gulp = require('gulp');
	screeps = require('gulp-screeps'),
	watch = require('gulp-watch'),
	credentials = require('./credentials.js'),
	ts = require('gulp-typescript');
 
gulp.task('screeps', function() {
	// gulp.src('dist/*.js')
	// 	.pipe(screeps(credentials));

	var tsResult = gulp.src(['code/ts/**.ts', 'code/dts/**.ts', "./node_modules/screeps-typescript-declarations/dist/screeps.d.ts"])
		.pipe(ts({
			// noImplicitAny: true,
			// out: 'script.js'
			// declaration: true,
			// noExternalResolve: true,
			// target: 'ES6',
			removeComments: true,
		}));
	
	/* Use this one if you want the definitions to be output as well: */
	// return merge([
	//   tsResult.dts.pipe(gulp.dest('public/definitions')),
	//   tsResult.js.pipe(gulp.dest('public/js'))
	// ]).pipe(browserSync.stream());

	return tsResult.js.pipe(gulp.dest('.cache'));
	// return tsResult.js.pipe(screeps(credentials));//.pipe(gulp.dest('.cache'));
});

gulp.task('default', ['screeps'], function(){
	// gulp.watch("dist/*.js", ['screeps']);
	gulp.watch("code/*/**.ts", ['screeps']);
});