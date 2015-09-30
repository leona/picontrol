var config      = require(__dirname + '/config.json');
var messenger   = require('messenger');
var fs          = require('fs');
var shell       = require(__dirname + '/lib/shell')(config);
var client      = messenger.createSpeaker(config.server_listener + ':' + config.server_port);
var interval;

global.__root   = __dirname;

start(1000);

function start(interval) {
    interval = setInterval(comListen, interval);
}

function end() {
    clearInterval(interval);
}

function comListen() {
    client.request('command_listen', {
        key: config.access_key, /* replace with time encrypted key */
        name: config.name
    }, function(data) {
        if (valid()) {
            switch(data.type) {
                case 'shell':
                    var call_func = data.action;
                    
                    if (typeof shell[call_func] == 'function') {
                        var resp = shell[call_func](data);
                            
                        if (typeof resp !== 'undefined' && typeof resp.output !== 'undefined') {
                            resp = resp.output;
                        } else {
                            var resp = '';
                        }
                     
                        respond({ response: resp});
                    } else {
                        respond({ response: 'shell action not found'});
                    }
                break;
                case 'fetch_log':
                    var contents = fs.readFileSync(__dirname + '/tasks/logs/' + data.data).toString();
                    
                    respond({ response: contents });
                case 'fetch_config':
                    respond({ response: config[data.data]});
                break;
                case 'set_interval':
                    end();
                    start(data.data);
                break;
                case 'update_config':
                    forEach(data.data, function(key, item) {
                        config[key] = item;
                    });
                    
                    fs.writeFileSync(__root + '/config.json', JSON.stringify(config));
                    respond({ response: 'config_update_success'});
                break;
                default:
                    respond({ response: 'command type not found'});
                break;
            }
        }
        
        function valid() {
            if (typeof data.key !== 'undefined') {
                if (data.key == config.access_key) {
                    if (typeof data.identifier !== 'undefined') {
                        if (typeof data.type !== 'undefined') {
                            return true;
                        }
                    }
                }
            }
        }
        
        function respond(data) {
            var default_resp = {
                key: config.access_key,
                identifier: data.identifier,
                name: config.name
            }
            
            client.request('command_response', objMerge(default_resp, data));
        }
    });
}

function objMerge(){
    for (var i=1; i<arguments.length; i++)
       for (var a in arguments[i])
         arguments[0][a] = arguments[i][a];
         
   return arguments[0];
}

var forEach = function(obj, callback) {
    for (var key in obj) {
       if (obj.hasOwnProperty(key)) {
           //var obj = obj[key];
            callback(key, obj[key]);
        }
    }
}