module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		eslint: {
			src: ['app.js', 'lib/**/*.js']
		},
		jshint: {
			all: ['Gruntfile.js','app.js', 'lib/**/*.js'],
			options: {
				esversion: 6
			}
		}
	});
	grunt.loadNpmTasks('gruntify-eslint');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.registerTask('default', [
		'eslint'
	]);
};