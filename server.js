var config      = require(__dirname + '/config.json');
var clients     = require(__dirname + '/lib/clients');
var readline    = require('readline');
var messenger   = require('messenger');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

server = messenger.createListener('127.0.0.1:' + config.server_port);

console.log('\033[2J');
console.log('- - Welcome to PiControl - -');
console.log('Command options: [ls, shell, fetch_config, set_interval]');
console.log('e.g. shell sb --action runTask --data.task ssh_remote --data.proc_name ssh');
console.log('');

setInterval(function() {
  clients.ticker(expecter);
}, 1000);

setTimeout(function() {
  expecter();
}, 1010);

server.on('command_listen', function(con, data){
  if (data.key == config.access_key) {
    clients.poll(data.name, expecter);
    
    reply({'type':'fetch_log', 'data': 'test.txt'});
  }
  
  
  function reply(obj) {
    var defaults = {
      key: config.access_key,
      identifier: '467568344378769',
    }
    
    con.reply(objMerge(obj, defaults));
  }
});


server.on('command_response', function(con, data) {
  console.log(data);
});


function expecter() {
  expect(expectParser);
}
function expect(callback) {
  rl.question("Enter command to execute: ", callback);
}

function expectParser(command) {
  
  
  //expect(expectParser);
}

function objMerge(){
    for (var i=1; i<arguments.length; i++)
       for (var a in arguments[i])
         arguments[0][a] = arguments[i][a];
         
   return arguments[0];
}