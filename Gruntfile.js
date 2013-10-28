module.exports = function(grunt) {
	
	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
		betajs_templates: {
			dist: {
			    files: {
				  "dist/templates.js": [ 
  			          'src/views/*/template.html',
					]
				}
			}
		},
		concat : {
			options : {
				banner : '/*!\n'
						+ '  <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n'
						+ '  Copyright (c) Victor Lingenthal\n'
						+ '  MIT Software License.\n' + '*/\n'
			},
			dist : {
				dest : 'dist/betajs-richeditor.js',
				src : [
			        'dist/templates.js',
			        'src/views/simple_rich_editor_view/view.js',
			        'src/views/rich_editor_view/view.js',
				]
			},
			dist_scss: {
				dest : 'dist/betajs-richeditor.scss',
				src : [
			        'src/views/*/styles.scss',
			    ]
			},
		},
		sass: {
			dist: {
		    	files: {
			        'dist/betajs-richeditor.css': 'dist/betajs-richeditor.scss'
		    	}
		    }
		},
		uglify : {
			dist : {
				files : {
					'dist/betajs-richeditor.min.js' : [ 'dist/betajs-richeditor.js' ],
				}
			}
		},
		cssmin: {
			options : {
				banner : '/*!\n'
						+ '  <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n'
						+ '  Copyright (c) Victor Lingenthal\n'
						+ '  MIT Software License.\n' + '*/\n'
			},
			dist : {
				files : {
					'dist/betajs-richeditor.min.css' : [ 'dist/betajs-richeditor.css' ]
				}
			}
		},
		clean: [
			"dist/templates.js",
			"dist/betajs-richeditor.scss"
		]
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-sass');	
	grunt.loadNpmTasks('grunt-contrib-cssmin');	
	grunt.loadNpmTasks('grunt-contrib-clean');	
	grunt.loadNpmTasks('grunt-betajs-templates');	
	

	grunt.registerTask('default', ['betajs_templates', 'concat', 'sass', 'uglify', 'cssmin', 'clean']);

};