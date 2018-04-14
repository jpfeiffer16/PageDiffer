# PageDiffer
A command line tool to compare two web pages.

## Usage
Install with `npm install -g pagediffer` and use the `pagediffer` to run compares

## Info

The tool currently uses a file-sytem based method to store compares where individual compares are given their own unique ids. This will likely be changed to use SQLite in the future to enable a more familar and simple format for querying using the `query` sub-command.


## Commands

`compare` - use this to run new compares between two or more sites. Use the -h flag for usage info.

`query` - use this to get information about compare jobs that have been run. Use the -h flag for usage info.


