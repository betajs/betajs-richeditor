module.banner = '/*!\n<%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\nCopyright (c) <%= pkg.contributors %>\n<%= pkg.license %> Software License.\n*/\n';

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
		copy: {
		  main: {
		    files: [
		      {expand: true, cwd: 'src/vendors/icomoon', src: 'icomoon.css', dest: 'dist/vendors'}, 
		      {expand: true, cwd: 'src/vendors/icomoon/fonts', src: '*', dest: 'dist/vendors/fonts'}
		    ]
		  }
		},
		concat : {
			options : {
				banner : module.banner
			},
			dist : {
				dest : 'dist/betajs-richeditor.js',
				src : [
			        'dist/templates.js',
			        'src/views/simple_rich_editor_content_view/view.js',
			        'src/views/rich_editor_content_view/view.js',
			        'src/views/rich_editor_view/view.js',
				]
			},
		},
		sass: {
			dist: {
		    	files: {
			        'dist/betajs-richeditor.css': [
       					'src/assets/theme-main.scss',
    			        'src/views/*/styles.scss',
                       ]
		    	}
		    }
		},
		uglify : {
			options : {
				banner : module.banner
			},
			dist : {
				files : {
					'dist/betajs-richeditor.min.js' : [ 'dist/betajs-richeditor.js' ],
				}
			}
		},
		cssmin: {
			options : {
				banner : module.banner
			},
			dist : {
				files : {
					'dist/betajs-richeditor.min.css' : [ 'dist/betajs-richeditor.css' ]
				}
			}
		},
		clean: [
			"dist/templates.js",
		],
		shell: {
			lint: {
		    	command: "jsl +recurse --process ./src/*.js",
		    	options: {
                	stdout: true,
                	stderr: true,
            	},
            	src: [
            		"src/*/*.js"
            	]
			},
			cssvalidate: {
				command: "w3c-validator.py --verbose dist/betajs-richeditor.css",
		    	options: {
                	stdout: true,
                	stderr: true,
            	},
            	src: [
            		"src/*/*.*css"
            	]
			},
		},
	});

	grunt.loadNpmTasks('grunt-newer');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-sass');	
	grunt.loadNpmTasks('grunt-contrib-cssmin');	
	grunt.loadNpmTasks('grunt-contrib-clean');	
	grunt.loadNpmTasks('grunt-betajs-templates');	
	

	grunt.registerTask('default', ['newer:betajs_templates', 'newer:concat', 'newer:sass', 'newer:uglify', 'newer:cssmin', 'clean']);
	grunt.registerTask('lint', ['shell:lint']);	
	grunt.registerTask('cssvalidate', ['shell:cssvalidate']);	
	grunt.registerTask('check', ['lint']);

};