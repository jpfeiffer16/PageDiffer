#!/usr/bin/env node

var program = require('commander');

program
  .command('query', 'Query the list of existing jobs and compares')
  .command('compare', 'Create a new compare between two or more urls')
  .parse(process.argv);