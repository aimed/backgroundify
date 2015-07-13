module.exports = function (grunt) {
  'use strict';

  // Project configuration.
 grunt.initConfig({
   pkg: grunt.file.readJSON('package.json'),

   browserify: {
     dist: {
       options: {
         transform: [
           ['babelify', {
             'optional': ['es7.asyncFunctions', 'runtime']
           }]
         ]
       },
       files: {
         'build/backgroundify.js' : ['src/backgroundify.js']
       }
     }
   },

   watch: {
     files: ['src/*.js'],
     tasks: ['browserify']
   }
 });

 // Load the plugin that provides the "uglify" task.
 grunt.loadNpmTasks('grunt-browserify');
 grunt.loadNpmTasks('grunt-contrib-watch');

 // Default task(s).
 grunt.registerTask('default', ['browserify']);
}
