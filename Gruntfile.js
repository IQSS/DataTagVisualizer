module.exports = function (grunt) {


    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        ngAnnotate: {
            options: {
                singleQuotes: true,
            },
            app: {
                files: {
                    'app/src/js/dataTagsVisalizer.js': [
                        'src/module.js',
                        'src/parser/parser.js',
                        'src/decisionGraph/js/assignment-viewer.js',
                        'src/decisionGraph/js/desicionGraph.js',
                        'src/decisionGraph/js/nodes.js',
                        'src/tagSpace/js/slots.js',
                        'src/tagSpace/js/tagSpaceAccordion.js',
                        'src/Graph/js/nodeColors.js',
                        'src/Graph/js/modal.js',
                        'src/Graph/js/graph.js',
                        'src/dataServices/js/dataService.js',
                        'src/dataServices/js/openFile.js',
                        'dataService.js',
                        'openFile.js',

                    ]
                }
            }
        },
        concat: {

            css: {
                src: ['src/css/*.css'],
                dest: 'app/src/css/dataTagsVisalizer.css',


            },

        },
        uglify: {
            my_target: {
                files: {
                    'app/src/js/dataTagsVisalizer.min.js': ['app/src/js/dataTagsVisalizer.js'],
                    //'app/src/css/dataTagsVisalizer.min.css': ['app/src/css/dataTagsVisalizer.css']
                }
            }
        },
        cssmin: {
            target: {
                files: [{
                    expand: true,
                    cwd: 'app/src/css',
                    src: ['dataTagsVisalizer.css'],
                    dest: 'app/src/css',
                    ext: '.min.css'
                }]
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-ng-annotate');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask("min", ['uglify','cssmin']);
    grunt.registerTask("conc", ['concat:css','ngAnnotate']);
}	