#!/usr/bin/env node
var webshot = require('webshot'),
    resemble = require('node-resemble-js'),
    fs = require('fs'),
    program = require('commander');

program
  .version(require('./package.json').version)
  .option('-t, --target [string]', 'Target webpage')
  .option('-s, --source [string]', 'Source webpage')
  .option('-p, --pipe [boolean]', 'Output Compare image data to stdout')
  .parse(process.argv);

if (!program.source || !program.target)
  throw('Must specify a source and target. Use --help for usage info.');


getDiff(program.source, program.target, __dirname + '/', function(info) {
  if (program.pipe)
    console.log(info.data);
  else
    console.log('Similarity: ', info.similarity, '%');
});

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
