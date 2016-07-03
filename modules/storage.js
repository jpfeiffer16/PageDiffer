var fs = require('fs');
var StorageWriter = function(path) {
  this.newCompare = function(name, callback) {
    var newPath = path + name + '/';
    fs.mkdir(newPath, function() {
      if (typeof callback === 'function')
        callback(newPath); 
    });
  }
}

var StorageManager = function(dir) {
  //Proccess:
  //This will create a top level uniquely id'd folder
  //This will expose a method to get a StorageWriter object
  //which will allow for writing specific compares in their
  //own respective folders

  //NOTE: Create the top-level dir for the compare
  var id = 12345; //Temporary
  var path = dir + '/' + id + '/';
  fs.mkdir(path, function(err) {
    if (err) throw err;
  });

  this.getWritter = function() {
    return new StorageWriter(path);
  };
}

modules.exports = new Storage();
