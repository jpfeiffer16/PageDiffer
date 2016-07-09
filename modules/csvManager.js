var csv = require('csv-parse');

var CsvManager = function() {
  var self = this;

  self.parse = function(data, callback) {
    //TODO: csv stuff here.
    //console.dir(csv);
    csv(data, {
      columns: true,
      trim: true
    },  function(err, output) {
      if (typeof callback === 'function') {
        callback(output); 
      }
    });
  };
};

module.exports = new CsvManager();
