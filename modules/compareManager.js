var Q = require('q');
var webshot = require('webshot'),
    fs = require('fs'),
    resemble = require('node-resemble-js');

var CompareManger = function() {

  var self = this;

  self.doCompare = function(compare, storageWriter, threads) {

    //TODO: Need to test between a single object and an array of compares here.
    if (!compare.length) {
      //TODO: Need some sanity checks on the compare object here.
      getDiff(compare.sourceUrl, compare.targetUrl, __dirname, null)
        .then(function(info) {
           console.log('Done with compare');
        }, function(err) {
          console.error(err);
        }, function(progress) {
          //TODO: Progress will be reported here when the time comes. 
        });
    } else {
      //TODO: Multiple compares here
      var count = compare.length;
      var done = 0;
      var index = 0;
      var numThreads = threads || 3;
      if (compare.length < numThreads)
        numThreads = compare.length;
      var threadPool = [];
      //threadPool.length = numThreads;
      for (var i = 0; i < numThreads; i++) {
        threadPool.push(null);
      }
      //console.log(threadPool);      
      reloadThreads();
      function reloadThreads() {
        //TODO: Check if we're done here
        console.log('Preparing to load threads');
        threadPool.forEach(function(item) {
          console.log('loading a thread');
          if (item == null ||
              item.inspect().state == 'fulfilled' ||
              item.inspect().state == 'rejected') {
            //NOTE: Add a new compare and run it here.
            var currentCompare = compare[index];
            storageWriter.newRecord(
                currentCompare.sourceUrl + '-' + currentCompare.targetUrl,
                function(path) {
              getDiff(
                  currentCompare.sourceUrl,
                  currentCompare.targetUrl,
                  path,
                  null)
                .then(function() {
                  //Success here 
                  done++;
                  reloadThreads();
                }, function() {
                  //Failure here
                  done++;
                  reloadThreads();
                });
              index++;
            });
          }
        });
      }
    }
  }
}

function getDiff(sourceUrl, targetUrl, dir, callback) {
  var deferred = Q.defer();
  var website1Image = dir + sourceUrl + '.png';
  var website2Image = dir + targetUrl + '.png';
  webshot(sourceUrl, website1Image, function(err) {
    if (err) {
      deferred.reject(err);
    }
    webshot(targetUrl, website2Image, function(err) {
      if (err) {
        deferred.reject(err);
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
              deferred.reject(err);
            }
            if (typeof callback == 'function') deferred.resolve({
              similarity: 100 - data.misMatchPercentage,
              data: base64
            });
          });
        });
      });
    });
  });
  return deferred.promise;
}
module.exports = new CompareManger();
