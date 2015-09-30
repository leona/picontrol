var config = require(__dirname + '/../config.json');

module.exports = function() {

    var active          = [];
    var disconnected    = [];
    var pool            = [];
    var queue           = [];
    var timeout         = config.timeout;

    var app = function() {
        return this;
    }

    app.prototype.active = function() {
        return active;
    }
    
    app.prototype.addCommand = function(client, obj) {
        if (typeof active[client] == 'undefined') {
            console.log('Client is offline');
            return;
        }
        
        if (typeof queue[client] == 'undefined') 
            queue[client] = [];
            
        queue[client].push(obj);
    }
    
    app.prototype.getCommand = function(client) {
        if (typeof queue[client] !== 'undefined') {
            var command = queue[client][0];

            delete queue[client][0];
            return command;
        }
    }
    app.prototype.ticker = function(change) {
        var timeout_time = Date.now() / 1000 - timeout;
        
        active.forEach(function(item, key) {
            if (pool[item] < timeout_time) {
                //check if client is processing a command before disconnecting
                console.log('\r\nClient disconnected: ' + item);
                
                change();
                delete active[item];
                delete pool[item];
                delete queue[item];
                
                disconnected.push(item);
            }
        })
    }

    app.prototype.poll = function(client, change) {
        if (typeof pool[client] == 'undefined') {
            active.push(client);
            console.log('\r\nClient connected: ' + client);
            change();
        }
        
        pool[client] = Date.now() / 1000;
    }

    return new app;
}();