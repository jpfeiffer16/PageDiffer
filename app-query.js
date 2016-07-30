var program = require('commander');




/*

pagediffer query -j '"compares"'



*/
//TOOO: Define command options here
program
  .option('-j, --jobs [boolean]', 'List the stored jobs and the number of compares in each.')
  .parse(process.argv);

if (program.jobs) {
  var StorageManager = require('./modules/storageManager');
  var jobs = StorageManager.parse().jobs;
  jobs.forEach(function(job) {
    console.log(
      job.id, '(' + (!job.error ? 
      job.compares.length : 'Error') + ')'
    );
  });
}