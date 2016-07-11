var fs = require('fs'),
    uuid = require('node-uuid');
var StorageWriter = function(path) {
  this.newRecord = function(name, callback) {
    var newPath = path + name + '/';
    fs.mkdir(newPath, function() {
      if (typeof callback === 'function')
        callback(newPath); 
    });
  };

  this.newFile = function(name, content, callback) {
    var newPath = path + name;
    fs.writeFile(newPath, content, 'utf-8', function(err) {
      if (typeof callback === 'function')
        callback(err);
    });
  };
  
  this.path = path;
}

var StorageManager = function(dir) {
  //Proccess:
  //This will create a top level uniquely id'd folder
  //This will expose a method to get a StorageWriter object
  //which will allow for writing specific compares in their
  //own respective folders

  //NOTE: Create the top-level dir for the compare
  var id = 'compare-' + uuid.v4();
  var path = dir + '/' + id + '/';
  fs.mkdir(path, function(err) {
    if (err) throw err;
  });

  this.getWritter = function() {
    return new StorageWriter(path);
  };
}

module.exports = StorageManager;
