module.exports = function(grunt) {

	var pkg = grunt.file.readJSON('package.json');
	var gruntHelper = require('betajs-compile');
	var dist = 'betajs-richeditor';

	gruntHelper.init(pkg, grunt)
	
	
    /* Compilation */    
    .scopedclosurerevisionTask(null, "src/**/*.js", "dist/" + dist + "-noscoped.js", {
		"module": "global:BetaJS.Dynamics.RichEditor",
		"base": "global:BetaJS",
		"browser": "global:BetaJS.Browser",
		"dynamics": "global:BetaJS.Dynamics",
		"jquery": "global:jQuery"
    }, {
    	"base:version": pkg.devDependencies.betajs,
    	"browser:version": pkg.devDependencies["betajs-browser"],
    	"dynamics:version": pkg.devDependencies["betajs-dynamics"]
    })	
    .preprocessrevisionTask(null, 'dist/' + dist + '-raw.js', 'dist/' + dist + '-noscoped.js')
    .concatTask('concat-scoped', [require.resolve("betajs-scoped"), 'dist/' + dist + '-noscoped.js'], 'dist/' + dist + '.js')
    .uglifyTask('uglify-noscoped', 'dist/' + dist + '-noscoped.js', 'dist/' + dist + '-noscoped.min.js')
    .uglifyTask('uglify-scoped', 'dist/' + dist + '.js', 'dist/' + dist + '.min.js')
    .concatTask('concat-css', ['src/*.css'], 'dist/' + dist + ".css")
    .packageTask()

    /* Testing */
    .closureTask(null, [require.resolve("betajs-scoped"), require.resolve("betajs"), require.resolve("betajs-browser"), require.resolve("betajs-dynamics"), "./dist/betajs-richeditor-noscoped.js"], null, { jquery: true })
    .lintTask(null, ['./src/**/*.js', './dist/' + dist + '-noscoped.js', './dist/' + dist + '.js', './Gruntfile.js'])
    
    /* External Configurations */
    .codeclimateTask()
    
    /* Markdown Files */
	.readmeTask()
    .licenseTask()
    
    /* Documentation */
    .docsTask();

	grunt.initConfig(gruntHelper.config);	

	grunt.registerTask('default', ['package', 'readme', 'license', 'codeclimate', 'scopedclosurerevision', 'concat-scoped', 'uglify-noscoped', 'uglify-scoped']);
	grunt.registerTask('check', ['lint']);

};
