var shell = require('shelljs');

module.exports = function(config) {
    
    var active_procs        = [];
    var post_active_procs   = [];
    
    var app = function() {
        return this;
    }
    
    app.prototype.reboot = function() {
        shell.exec('sudo reboot');
    }
    
    app.prototype.exec = function(data) {
        return shell.exec(data.command);
    }
    
    app.prototype.restartSelf = function() {
        //start a monitor task that kills all processes started by picontrol, waits till they have finished exiting
        //then starts it up again
    }
    
    app.prototype.inspectTask = function(data) {
        //send back cat of monitor file
    }
    
    app.prototype.runTask = function(data) {
        if (typeof data.proc_name !== 'undefined') {
            this.active_procs[data.proc_name] = [];
            this.post_active_procs[data.proc_name] = [];
    
            this.activeProcs(data.proc_name, function(proc) {
                this.active_procs[data.proc_name].push(proc);
            });
        }
        
        if (typeof data.params == 'undefined')
            var params = '';
    
        if (typeof data.monitor == 'undefined') {
            data.monitor = '';
        } else {
            data.monitor = ' > ' + data.task;
        }
    
        shell.exec('sudo forever start ' + __root + '/tasks/' + data.task + '.js ' + data.params + data.monitor);
        
        if (typeof data.proc_name !== 'undefined') {
            this.activeProcs(data.proc_name, function(proc) {
                this.post_active_procs[data.proc_name].push(proc);
            });
        }
    }
    
    app.prototype.stopTask = function(data) {
        if (typeof data.proc_name !== 'undefined') {
            var check_procs      = [];
            var post_check_procs = [];
            
            this.activeProcs(data.proc_name, function(proc) {
                check_procs[data.proc_name].push(proc);
            });
        }
        
        shell.exec('sudo forever stop ' + __root + '/tasks/' + data.task + '.js');
        
        if (typeof data.proc_name !== 'undefined') {
            this.activeProcs(data.proc_name, function(proc) {
                post_check_procs[data.proc_name].push(proc);
            });
            
            if (post_check_procs.length == check_procs) {
                //task doesn't seem to have stopped
            }
        }
        
    }
    
    app.prototype.activeProcs = function(data) {
        var ssh_grep = shell.exec('sudo pgrep ' + data.proc);
    
        if (ssh_grep.output !== '') {
            ssh_grep = ssh_grep.split("\r\n");
    
            ssh_grep.forEach(function(item, key) {
                if (typeof item == 'number') {
                    data.iterator(item);
                }
                //else {
                    //parseOutputError(item) // check whether fatal or not. if fatal call fail()
                //}
            })
        }
    }
    
    return new app;
}