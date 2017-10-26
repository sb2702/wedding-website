/**
 * Created by sam on 9/29/17.
 */
/**
 * Created by sam on 16-9-19.
 */

var async = require('async');
var fs = require('fs');


module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-open');
    var exec= require('child_process').exec;
    var spawn= require('child_process').spawn;
    var StringDecoder = require('string_decoder').StringDecoder;


    grunt.initConfig({


        open : {
            main: {
                path: 'http://localhost:3000/',
                app: 'google-chrome-stable --incognito'
            }
        },


        clean: {
            build: ['build/src']
        },



        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/',
                        src: ['**', '!*~'],
                        dest: 'build/src/',
                        filter: 'isFile'
                    },

                    {
                        expand: true,
                        cwd: '',
                        src: ['package.json'],
                        dest: 'build/src/',
                        filter: 'isFile'
                    }
                ]

            }

        }

    });




    grunt.registerTask('localServer', 'runs the local server', function () {


        var done = this.async();

        var server = spawn('node', ['server', 'local'], {maxBuffer: 1024 * 10500, cwd: './src/'});

        var decoder = new StringDecoder('utf8');

        server.stdout.on('data', function(data) {
            var output = decoder.write(data);
            grunt.log.write("Server: " + output);
        });


        server.stderr.on('data', function(data) {
            grunt.log.error("A problem ocurred with the server while testing the local buildandroid server "+ decoder.write(data));
            error = true;
        });


    });



    grunt.registerTask('buildDocker', 'build the local version of docker', function () {

        var done = this.async();

        var cmd = ['build', '-t', 'sb2702/wedding-server', '.'];

        var process = spawn('docker', cmd, {maxBuffer: 1024 * 10500, cwd:'build'});
        var decoder = new StringDecoder('utf8');

        process.stdout.on('data', function (data) {
            var output = decoder.write(data);
            grunt.log.write("Server: " + output);
        });


        process.stderr.on('data', function (data) {
            grunt.log.error("A problem ocurred with the server while testing the local server " + decoder.write(data));
        });


        process.on('close', function () {
            grunt.log.write("Built docker");
            done();
        });



    });

    grunt.registerTask('pushDocker', 'Push the docker instance to the docker cloud', function (version) {


        var done = this.async();


        var cmd = ['push',  'sb2702/wedding-server'];


        var process = spawn('docker', cmd, {maxBuffer: 1024 * 10500});
        var decoder = new StringDecoder('utf8');

        process.stdout.on('data', function (data) {
            var output = decoder.write(data);
            grunt.log.write("Server: " + output);
        });


        process.stderr.on('data', function (data) {
            grunt.log.error("A problem ocurred with the server while testing the local server " + decoder.write(data));
        });


        process.on('close', function () {
            grunt.log.write("Pushed docker to cloud");
            done();
        });


    });




    grunt.registerTask('testDocker', 'Test the local Index instance', function () {

        var done = this.async();

        var envVars = [];

        var runArray = ['run'];

        envVars.forEach(function (key) {

            runArray.push('-e');
            runArray.push(key + "=" + process.env[key]);
        });

        runArray.push('-p');
        runArray.push('3000:3000');
        runArray.push('sb2702/wedding-server');

        var server = spawn('docker',  runArray , {maxBuffer: 1024 * 10500});
        var decoder = new StringDecoder('utf8');

        var which = grunt.option('file');

        var error = false;


        server.stdout.on('data', function (data) {

            var output = decoder.write(data);
            grunt.log.write("Server: " + output);


        });


        server.stderr.on('data', function (data) {
            grunt.log.error("A problem ocurred with the server while testing the local server " + decoder.write(data));
            //  error = true;
        });



    });



    grunt.registerTask('local', ['open:main', 'localServer']);


    grunt.registerTask('local', ['open:main', 'localServer']);


    grunt.registerTask('docker', ['build', 'open:main', 'testDocker']);

    grunt.registerTask('build', ['clean:build', 'copy:main', 'buildDocker']);




    grunt.registerTask('push', ['build', 'pushDocker']);







};
