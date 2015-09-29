var config = require(__dirname + '/../config.json');

module.exports = function() {

    var active          = [];
    var disconnected    = [];
    var pool            = [];
    var timeout         = config.timeout;

    var app = function() {
        return this;
    }

    app.prototype.ticker = function(change) {
        var timeout_time = Date.now() / 1000 - timeout;
        
        active.forEach(function(item, key) {
            if (pool[item] < timeout_time) {
                console.log('\r\nClient disconnected: ' + item);
                
                change();
                delete active[item];
                delete pool[item];

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