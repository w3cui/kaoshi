var gulp = require('gulp');
var uglify = require('gulp-uglify');
var minifycss = require('gulp-minify-css');
var less = require('gulp-less');
var csso = require('gulp-csso');
var gutil = require('gulp-util');
var rename = require('gulp-rename');
var runSequence = require('run-sequence').use(gulp);
var del = require('del');
var header = require('gulp-header');
// var babel = require("gulp-babel");
// var removeUseStrict = require("gulp-remove-use-strict");

var pkg = require('./package.json');
var config = require('./config/gulp.pro.config.js')(pkg);

var lwj = {
	compress: false,
	data: config,
	"note": [
		'/**\n * <%= pkg.name %> - v<%= pkg.version %> <%= pkg.license %> License By \n * <%= pkg.description %> \n */\n<%= js %>', {
			pkg: pkg,
			js: ""
		}
	],
	minify(dest, $data) {
		//JS 压缩copy
		gulp.src([$data.css + '**/*.js', '!' + $data.css + '**/*.min.js'])
			// .pipe(babel({  
			//          presets: ['es2015']
			//      }))			
			.pipe(uglify())
			.pipe(header.apply(null, lwj.note))
			.on('error', (e) => {
				console.log(e + "1");
			})
			.pipe(gulp.dest(dest));
	},
	removeuse($name, $data) {
		//拷贝IMG CSS
		gulp.task($name, () => {
			//copy原生CSS文件,IMG文件
			gulp.src([$data.dest + "/**/*.js"])
				// .pipe(removeUseStrict())
				.pipe(gulp.dest($data.dest));

		});
	},
	copyCss($name, $data) {
		//拷贝IMG CSS
		gulp.task($name, () => {
			//copy原生CSS文件,IMG文件
			gulp.src(this.data[0].copeFormat($data))
				.pipe(gulp.dest($data.dest));
			// console.log('!' + $data.dest + '**/*.min.css');
			gulp.src([$data.css + '**/*.css', '!' + $data.dest + '**/*.min.css', '!' + $data.dest + 'css/plugin/*'])
				.pipe(minifycss())
				.pipe(header.apply(null, lwj.note))
				.pipe(gulp.dest($data.dest));
		});

	},
	allLess($name, $data) {
		//编译LESS
		gulp.task($name, () => {
			gulp.src([$data.less + '**/*.less',
					'!' + $data.less + '**/less_public/*.less',
					'!' + $data.less + '**/_*.less'
				])
				.pipe(less({
					compress: lwj.compress
				}))
				.pipe(minifycss())
				.pipe(header.apply(null, lwj.note))
				.on('error', (e) => {
					console.log(e);
				})
				.pipe(gulp.dest($data.dest))
		});
	},
	watchTask($name, $data) {
		gulp.task($name, () => {
			gulp.src([$data.css + '/**/*.css', $data.css + '/**/*.js'])
				// .pipe(babel({  
				//          presets: ['es2015']  
				//      }))
				.on('error', (e) => {
					console.log(e);
				})
				.pipe(gulp.dest($data.dest));
		});
	}
};


var dest = pkg.env.dest; // 发布目录 
var src = pkg.env.src; // 原文件目录
var srcPlugin = src + "lib/",
	destPlugin = dest + "lib/";

//插件发布
gulp.task('pluginCopy', () => {
	//copy原生CSS文件,IMG文件

	gulp.src([srcPlugin + "**/*.js", '!' + srcPlugin + '**/*.min.js'])
		.pipe(uglify())
		.pipe(gulp.dest(destPlugin), (event) => {
			console.log(event);
		});

	gulp.src([srcPlugin + "**/*.css", '!' + srcPlugin + '**/*.min.css'])
		.pipe(minifycss())
		.pipe(gulp.dest(destPlugin));

	gulp.src([srcPlugin + '**/*.jpg', srcPlugin + '**/*.png', srcPlugin + '**/*.svg', srcPlugin + '**/*.gif', srcPlugin + '**/*.swf', srcPlugin + '**/*.eot', srcPlugin + '**/*.ttf', srcPlugin + '**/*.woff'])
		.pipe(gulp.dest(destPlugin), (event) => {
			console.log(event);
		});

});

lwj.data.map((value, key) => {
	// 初始化基础命令
	value.init(lwj);
	// 发布脚步
	gulp.task(...value.dev(lwj));
	//自动编译
	gulp.task(...value.watch(lwj));
});



// // 全站编译
// gulp.task('default', gulpDefault);