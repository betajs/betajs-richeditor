module.exports = function(grunt) {

	var pkg = grunt.file.readJSON('package.json');
	var gruntHelper = require('betajs-compile/grunt.js');
	var dist = 'betajs-richeditor';

	gruntHelper.init(pkg, grunt)
	
	
    /* Compilation */    
    .concatTask('concat-raw', ['src/fragments/begin.js-fragment', 'src/**/*.js', 'src/fragments/end.js-fragment'], 'dist/' + dist + '-raw.js')
    .preprocessrevisionTask(null, 'dist/' + dist + '-raw.js', 'dist/' + dist + '-noscoped.js')
    .concatTask('concat-scoped', ['vendors/scoped.js', 'dist/' + dist + '-noscoped.js'], 'dist/' + dist + '.js')
    .uglifyTask('uglify-noscoped', 'dist/' + dist + '-noscoped.js', 'dist/' + dist + '-noscoped.min.js')
    .uglifyTask('uglify-scoped', 'dist/' + dist + '.js', 'dist/' + dist + '.min.js')
    .concatTask('concat-css', ['src/*.css'], 'dist/' + dist + ".css")

    /* Testing */
    .closureTask(null, ["./vendors/scoped.js", "./vendors/beta-noscoped.js",  "./vendors/betajs-browser-noscoped.js", "./vendors/betajs-dynamics-noscoped.js", "./dist/betajs-richeditor-noscoped.js"], null, { jquery: true })
    .lintTask(null, ['./src/**/*.js', './dist/' + dist + '-noscoped.js', './dist/' + dist + '.js', './Gruntfile.js'])
    
    /* External Configurations */
    .codeclimateTask()
    
    /* Dependencies */
    .dependenciesTask(null, { github: [
        'betajs/betajs-scoped/dist/scoped.js',
        'betajs/betajs/dist/beta-noscoped.js',
        'betajs/betajs-browser/dist/betajs-browser-noscoped.js',
        'betajs/betajs-dynamics/dist/betajs-dynamics-noscoped.js'
     ] })

    /* Markdown Files */
	.readmeTask()
    .licenseTask()
    
    /* Documentation */
    .docsTask();

	grunt.initConfig(gruntHelper.config);	

	grunt.registerTask('default', ['readme', 'license', 'codeclimate', 'concat-raw', 'preprocessrevision', 'concat-scoped', 'uglify-noscoped', 'uglify-scoped']);
	grunt.registerTask('check', ['lint']);

};
