var Q = require('q'),
    webshot = require('webshot'),
    fs = require('fs'),
    resemble = require('node-resemble-js');

var CompareManger = function() {
  var self = this;

  self.doCompare = function(compare, storageWriter, threads, callback) {
    //TODO: Need to test between a single object and an array of compares here.
    if (!compare.length) {
      //TODO: Need some sanity checks on the compare object here.
      //storageWriter.newRecord(fileSafe(compare.sourceUrl) + '-' + fileSafe(compare.targetUrl), function (path) {
      storageWriter.newCompare(function (path) {
        getDiff(compare.sourceUrl, compare.targetUrl, path)
        .then(function(info) {
            console.log('Done with compare');
        }, function(err) {
          console.error(err);
        }, function(progress) {
          //TODO: Progress will be reported here when the time comes. 
        });
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
      reloadThreads();
      function reloadThreads() {
        //TODO: Check if we're done here
        if (done >= count) {
          if (typeof callback === 'function') callback();
          return;
        }
        if (index >= count) setTimout(reloadThreads, 300);
        threadPool.forEach(function(item) {
          if (item == null ||
              item.inspect().state == 'fulfilled' ||
              item.inspect().state == 'rejected') {
            //NOTE: Add a new compare and run it here.
            var currentCompare = compare[index];
            storageWriter.newCompare(function(path) {
              item = getDiff(
                  currentCompare.sourceUrl,
                  currentCompare.targetUrl,
                  path)
                .then(function(data) {
                  //Success here 
                  done++;
                  storageWriter.newOverviewLink(path + 'compare.png');
                  reloadThreads();
                }, function() {
                  //Failure here
                  console.log('failure running compare');
                  done++;
                  reloadThreads();
                });
            });
            index++;
          }
        });
      }
    }
  }
}

function getDiff(sourceUrl, targetUrl, dir) {
  //TODO: Need some error checks here to make sure both images exist before we do the compare
  var deferred = Q.defer();
  //var website1Image = dir + fileSafe(sourceUrl) + '.png';
  //var website2Image = dir + fileSafe(targetUrl) + '.png';
  var website1Image = dir + 'source.png';
  var website2Image = dir + 'target.png';
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
          data.getDiffImage().pack()
            .pipe(fs.createWriteStream(dir + 'compare.png'));
          deferred.resolve({
            similarity: 100 - data.misMatchPercentage
          });
          fs.writeFile(dir + 'info.json', JSON.stringify({
            similarity: 100 - data.misMatchPercentage
          }), 'utf-8');
          //var png = data.getDiffImage(),
          //    pngBuffer = new Buffer([]),
          //    pngStream = png.pack();
          //pngStream.on('data', function(data) {
          //  pngBuffer = Buffer.concat([pngBuffer, data]);
          //});
          //pngStream.on('end', function() {
          //  var base64 = pngBuffer.toString('base64');
          //  fs.writeFile(dir + 'compare.png',
          //      base64, 'base64', function(err) {
          //    if (err) {
          //      deferred.reject(err);
          //    }
          //    deferred.resolve({
          //      similarity: 100 - data.misMatchPercentage,
          //      data: base64
          //    });
          //  });
          //  fs.writeFile(dir + 'info.json', JSON.stringify({
          //    similarity: 100 - data.misMatchPercentage
          //  }), 'utf-8');
          //});
      });
    });
  });
  return deferred.promise;
}

function fileSafe(name) {
  if (name == undefined) return undefined;
  return name
    .replace('http://', '')
    .replace('https://', '')
    .replace('/', '_') + '.png';
}

module.exports = new CompareManger();
