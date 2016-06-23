#!/usr/bin/env node
var webshot = require('webshot'),
    resemble = require('node-resemble-js'),
    fs = require('fs'),
    program = require('commander');

program
  .version(require('./package.json').version)
  .option('-t, --target [string]', 'Target webpage')
  .option('-s, --source [string]', 'Source webpage')
  .parse(process.argv);

var website1 = program.source,
    website2 = program.target,
    website1Image = __dirname + '/' + website1 + '.png',
    website2Image = __dirname + '/' + website2 + '.png';

webshot(website1, website1Image, function(err) {
  if (err) {
    console.warn(err);
    return process.exit(1);
  }
  webshot(website2, website2Image, function(err) {
    if (err) {
      console.warn(err);
      return process.exit(1);
    }
    resemble(website1Image).compareTo(website2Image)
      .onComplete(function(data) {
      console.dir(data); 
      var png = data.getDiffImage(),
          pngBuffer = new Buffer([]),
          pngStream = png.pack();
      pngStream.on('data', function(data) {
        pngBuffer = Buffer.concat([pngBuffer, data]);
      });
      pngStream.on('end', function() {
        var base64 = pngBuffer.toString('base64');
        console.log('Done getting base64 data');
        fs.writeFile(__dirname + '/compare.png',
            base64, 'base64', function(err) {
          if (err) {
            console.warn(err);
            process.exit(1);
          }
          console.log('Compare file has been written');
        });
      });
    });
  });
});

