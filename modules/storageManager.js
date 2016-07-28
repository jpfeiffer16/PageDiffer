var fs = require('fs'),
    uuid = require('node-uuid'),
    os = require('os');
var StorageWriter = function(path) {
  this.newRecord = function(name, callback) {
    var newPath = path + name + '/';
    fs.mkdir(newPath, function() {
      if (typeof callback === 'function')
        callback(newPath); 
    });
  };

  this.newCompare = function(callback) {
    var newPath = path + uuid.v4() + '/';
    fs.mkdir(newPath, function() {
      if (typeof callback === 'function')
        callback(newPath); 
    });
  };

  this.newOverviewLink = function(linkPath, callback) {
    var splitFileName = linkPath.split('/');
    var name = splitFileName[splitFileName.length - 2];
    fs.symlink(linkPath, path + 'overview/' + name + '.png', callback);
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

var StorageManager = function() {
  //Proccess:
  //This will create a top level uniquely id'd folder
  //This will expose a method to get a StorageWriter object
  //which will allow for writing specific compares in their
  //own respective folders
  var self = this;
  var os = require('os');
  var dir = os.homedir() + '/pagediff/';
  checkDirectory(dir)

  //NOTE: Create the top-level dir for the compare
  var id = 'compare-' + uuid.v4();
  self.path = dir + id + '/';
  fs.mkdir(self.path, function(err) {
    if (err) throw err;
  });
  fs.mkdir(self.path + 'overview', function(err) {
    if (err) throw err;
  });

  this.getWritter = function() {
    return new StorageWriter(self.path);
  };
}

var OperationManager = function() {
  this.write = function() {
    return new StorageManager();
  };
  this.parse = function() {
    return parseTree();
  };
}

function Job(srcpath) {
  var path = require('path');
  var self = this;
  self.compares = [];
  self.error = false;
  self.id = srcpath.split('/')[srcpath.split('/').length - 1]
    .replace('compare-', '');
  var comparesFiles = fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory() &&
      file.split('/')[file.split('/').length - 1] != 'overview';
  });
  if (comparesFiles.length == 0) self.error = true;
  comparesFiles.forEach(function(compareFile) {
    self.compares.push(new Compare(path.join(srcpath, compareFile)));
  });
}

function Compare(srcpath) {
  var path = require('path');
  var self = this;
  self.id = srcpath.split('/')[srcpath.split('/').length - 1];
  //For now we will only return the info.json
  //but eventually we will need properties pointing
  //to the source and targe images
  var infoJson = '';
  self.error = false;
  try {
    self.info = JSON.parse(
      fs.readFileSync(
        path.join(srcpath, 'info.json'), 'utf-8'
      )
    );
  } catch(e) {
    self.error = e;
  }
}

function parseTree() {
  var path = require('path');
  var returnObj = {};
  returnObj.jobs = [];
  var srcpath = os.homedir();
  var pagediffPath = path.join(srcpath, 'pagediff');
  var jobFiles = fs.readdirSync(pagediffPath).filter(function(file) {
    //console.log(file.split('/')[file.split('/').length - 1]);
    //var splitFolderName = file.split('/');
    //var folderName = splitFileName[splitFileName.length - 1];
    return fs.statSync(path.join(pagediffPath, file)).isDirectory();
  });
  jobFiles.forEach(function(jobFile) {
    returnObj.jobs.push(new Job(path.join(pagediffPath, jobFile)));
  });
  return returnObj;
}

function checkDirectory(directory) {  
  try {
    fs.statSync(directory);
  } catch(e) {
    fs.mkdirSync(directory);
  }
}

module.exports = new OperationManager();
