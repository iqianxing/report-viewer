#!/usr/bin/env node
var program = require('commander')
  , fs = require('fs')
  , path = require('path')
  , cwd = process.cwd()
  , http = require('http')
program
  .version(JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8')).version)
  .usage('[options] [command...]')
  .option('--port <n>', 'port', parseInt)
  .option('--opener', 'opens a browser')
  .option('--viewer <(module-)name>', 'loades a specific viewer')
  .parse(process.argv);

module.paths.push(cwd, path.join(cwd, 'node_modules'));

var server = http.createServer();
require("./lib/index.js")(server, program)
if(program.opener){
  var debug = require('debug');
  debug("opening browser");
  opener = require("opener");
  opener("http://localhost:" + program.port);
}
server.listen(program.port)
