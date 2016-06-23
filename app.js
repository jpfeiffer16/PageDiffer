var webshot = require('webshot');
var resemble = require('node-resemble-js');
var fs = require('fs');

var website1 = 'google.com';
var website2 = 'google.co.uk';
var website1Image = __dirname + '/' + website1 + '.png';
var website2Image = __dirname + '/' + website2 + '.png';
console.log(website1Image, website2Image);

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
    resemble(website1Image).compareTo(website2Image).onComplete(function(data) {
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
        fs.writeFile(__dirname + '/compare.png', base64, 'base64', function(err) {
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

