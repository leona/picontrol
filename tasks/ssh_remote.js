var config = require(__dirname + '/../config.json');
var shell  = require('shelljs');

shell.exec('sudo ssh -i ' + config.ssh_key + ' -o "PubkeyAuthentication=yes" -o "PasswordAuthentication=no" -o "StrictHostKeyChecking=no" -R *:' + config.ssh_port + ':localhost:22 ' + config.ssh_host);

