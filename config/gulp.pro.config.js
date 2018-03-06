/*
 * @tql 2017/08/09
 * 丽维家官网发布脚本
 */

var gulp = require('gulp');
var runSequence = require('run-sequence').use(gulp);

let env;

module.exports = (pkg) => {
	env = pkg.env;
	let filelist = env.taskName;
	var data = [];
	filelist.map((value, key) => {
		data.push(mod(value, pkg));
	})
	return data;
};

let mod = (filename, pkg) => ({
	name: "", //
	filename: filename, // 模块的文件名
	// package项目配置
	version: pkg.version,
	env,
	// 配置
	exports: {
		css: env.src + filename + "/",
		less: env.src + filename + "/",
		dest: env.dest + filename + "/",
		src: env.src + filename + "/"
	},
	// 文件压缩格式
	copeFormat($data) {
		var data = [];
		[...this.env.images, ...this.env.mv, ...this.env.font].forEach((word) => data.push($data.css + '/**/*' + word));
		return data;
	},
	// 监听文件类型
	wat() {
		return [
			this.exports.css + '**/*.js',
			this.exports.css + '**/*.css',
			this.exports.less + '**/*.less'
		];
	},
	// 初始化命令
	init(lwj) {
		gulp.task(filename + "Minify", () => {
			lwj.minify(this.exports.dest + "/", this.exports);
		});
		lwj.copyCss(filename + "Copy_css", this.exports);
		lwj.allLess(filename + "All_less", this.exports);
		lwj.watchTask(filename + "Watch", this.exports);
		lwj.removeuse(filename + "Use", this.exports);

	},
	// 发布命令绑定
	dev(lwj) {
		return [filename + "Build", (cb) => {
			runSequence(filename + "Copy_css",filename + "All_less", [ "pluginCopy"], filename + "Minify", cb);
		}];
	},
	// 监听创建
	watch(lwj) {
		let watchdata = [filename + 'Watch', filename + "All_less"];
		return [filename, watchdata, (cb) => {
			gulp.watch(this.wat(),
				watchdata);
		}];
	}
});