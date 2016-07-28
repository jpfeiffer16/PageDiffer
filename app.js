#!/usr/bin/env node
var webshot = require('webshot'),
    resemble = require('node-resemble-js'),
    fs = require('fs'),
    program = require('commander');

program
  .version(require('./package.json').version)
  .option('-t, --target [string]', 'Target webpage')
  .option('-s, --source [string]', 'Source webpage')
  .option('-f, --file [string]',
      'File to read a list of compares from. Should be a csv structured file. The first line will be stripped off.')
  .option('-T, --threads [number]', 'Number of threads to use for csv files.')
  .option('-p, -pipe [boolean]',
      'Output Compare image data to stdout(In base64 format)')
  .option('-q, --query [boolean]', 'Query the list of compares.')
  .parse(process.argv);

if ((!program.source || !program.target) &&
    !program.file && !program.query)
  throw('Must specify a source and target or specify a file to use with the -f flag. Use --help for usage info.');

var CompareManager = require('./modules/compareManager');
var StorageManager = require('./modules/storageManager');

if (program.file !== undefined) {
  //TODO: Compare from csv here
  //TODO: Fix StorageManager so we don't need to use an explicit constructor
  var storageManager = StorageManager.write();
  var writer = storageManager.getWritter();
  fs.readFile(program.file, function(err, data) {
    var CsvManager = require('./modules/csvManager');
    CsvManager.parse(data, function(compares) {
      CompareManager.doCompare(compares, writer, program.threads || 3,
          function() {
            console.log('Done, comapare data at', write.path); 
          }
      );
    });
  });
} else if (program.query) {
  var StorageManager = require('./modules/storageManager');
  var jobs = StorageManager.parse().jobs;
  jobs.forEach(function(job) {
    console.log(
      job.id, '(' + (!job.error ? 
      job.compares.length : 'Error') + ')'
    ); 
  });
} else {
  CompareManager.doCompare({
    sourceUrl: program.source,
    targetUrl: program.target
  }, writer, program.thread || 3);
}
