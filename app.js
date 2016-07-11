#!/usr/bin/env node
var webshot = require('webshot'),
    resemble = require('node-resemble-js'),
    fs = require('fs'),
    program = require('commander'),
    os = require('os');

program
  .version(require('./package.json').version)
  .option('-t, --target [string]', 'Target webpage')
  .option('-s, --source [string]', 'Source webpage')
  .option('-f, --file [string]',
      'File to read a list of compares from. Should be a csv structured file. The first line will be stripped off.')
  .option('-T, --threads [number]', 'Number of threads to use for csv files.')
  .option('-p, -pipe [boolean]',
      'Output Compare image data to stdout(In base64 format)')
  .parse(process.argv);

if ((!program.source || !program.target) &&
    !program.file)
  throw('Must specify a source and target or specify a file to use with the -f flag. Use --help for usage info.');

if (program.file !== undefined) {
  //TODO: Compare from csv here
  var dirToUse = os.tmpdir();

  //var fs = require('fs');
  fs.readFile(program.file, function(err, data) {
    var CsvManager = require('./modules/csvManager');
    var CompareManager = require('./modules/compareManager');

    //Init storage stuff
    var StorageManager = require('./modules/storageManager');
    var storageManager = new StorageManager(dirToUse);
    var writer = storageManager.getWritter();

    CsvManager.parse(data, function(compares) {
      //console.log(data);
      //TODO: Pass to compare manger here. 
      //console.log(compares);
      CompareManager.doCompare(compares, writer, program.threads || 3,
          function() {
            console.log('Done, comapare data at', write.path); 
          }
      );
    });
  });
} else {
  getDiff(program.source, program.target, __dirname + '/', function(info) {
    if (program.pipe)
      console.log(info.data);
    else
      console.log('Similarity: ', info.similarity, '%');
  });
  //NOTE: Single compare here 
  function getDiff(sourceUrl, targetUrl, dir, callback) {
    var website1Image = dir + sourceUrl + '.png';
    var website2Image = dir + targetUrl + '.png';
    webshot(sourceUrl, website1Image, function(err) {
      if (err) {
        console.error(err);
        return process.exit(1);
      }
      webshot(targetUrl, website2Image, function(err) {
        if (err) {
          console.error(err);
          return process.exit(1);
        }
        resemble(website1Image).compareTo(website2Image)
          .onComplete(function(data) {
          var png = data.getDiffImage(),
              pngBuffer = new Buffer([]),
              pngStream = png.pack();
          pngStream.on('data', function(data) {
            pngBuffer = Buffer.concat([pngBuffer, data]);
          });
          pngStream.on('end', function() {
            var base64 = pngBuffer.toString('base64');
            fs.writeFile(dir + 'compare.png',
                base64, 'base64', function(err) {
              if (err) {
                console.error(err);
                process.exit(1);
              }
              if (typeof callback == 'function') callback( {
                similarity: 100 - data.misMatchPercentage,
                data: base64
              });
            });
          });
        });
      });
    });
  }
}
