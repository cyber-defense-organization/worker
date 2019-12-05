const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
var Request = require("request");
var mysql = require('mysql');
var ActiveDirectory = require('activedirectory');
const app = express()
var prop = require("./db_propate")
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())

//Team IP Info
var sshPort = 2220;
var teamIps = [
    '8.8.8.8',
    '8.8.8.9',
    '8.8.8.8',
    '8.8.8.9',
    '8.8.8.8',
]
var testSSH = [
    'bandit.labs.overthewire.org',
    'bandit.labs.overthewire.org',
    'bandit.labs.overthewire.orgs',
    'bandit.labs.overthewire.org',
    'bandit.labs.overthewire.orgs',
]
var boxNames = [
    'Linux1',
    'Linux2',
    'Windows1',
    'Windows2',
    '98',
]

//Services deps

//ICMP
var ping = require("net-ping");
var options = {
    networkProtocol: ping.NetworkProtocol.IPv4,
    packetSize: 16,
    retries: 1,
    sessionId: (process.pid % 65535),
    timeout: 2000,
    ttl: 128
};
var session = ping.createSession(options);
//DNS
var dns = require('dns');

//SSH
var node_ssh = require('node-ssh')
var ssh = new node_ssh()
    //DB -- SQL
    // npm install mysql

//FTP
var Client = require('ftp');
var c = new Client();

//AD (active directory) //doesnt work
var ActiveDirectory = require('activedirectory');
var config = {
        url: 'ldap://dc.domain.com',
        baseDN: 'dc=domain,dc=com',
        username: 'username@domain.com', // might not need these
        password: 'password'
    } //might not need these
var ad = new ActiveDirectory(config);

const mongodb_conn_module = require('./mongodbConnModule');
var db = mongodb_conn_module.connect();

//dbdepends
var Team = require("./models/team")
var creds = require("./models/auth")
var sTeam = require("./models/sTeam")

//middleware if we get that far
// const ICMP = require('./middleware/ICMP')

function insert_entry(status, name, db_index, error = false) {
    var entry = {
        timeStamp: Date.now(),
        status: status,
    }
    if (error) {
        entry["error"] = error
    } else {
        sTeam.update({ name: name }, {
            '$inc': {
                score: 1,
                shopScore: 1
            }
        }, function(err, affected, resp) {
            if (err) {
                console.log(err, resp)
            }
            //console.log('This response: ' , resp);
        });
    }
    sTeam.update({ name: name }, {
        '$set': {
            [db_index]: entry
        }
    }, function(err, affected, resp) {
        if (err) {
            console.log(err, resp)
        }
        //console.log('This response: ' , resp);
    });
}

async function get_creds(serviceName, teamName) {
    const foundUser = await creds.findOne({ name: teamName })
    return foundUser[serviceName + "_Creds"]
}

//This will get added to admin panel on Backend
app.get('/NaddTeam/:name', (req, res, next) => {
    var name = req.params.name;
    var new_entry = new sTeam(prop.sTeam_Prop(name))
    var cred = new creds(prop.sAuth_Prop(name));
    cred.save(function(error) {
        if (error) {
            console.log(error)
        }
    })
    new_entry.save(function(error) {
        if (error) {
            console.log(error)
        }
    })
    res.send({
        success: true
    })
})

app.get('/addTeam/:name', (req, res, next) => {
    var epochTime = Date.now();
    var name = req.params.name;
    var score = 0;
    var isOnline = true;
    var new_entry = new Team({
        name: name,
        score: score,
        services: [{
            ICMP: [{
                timeStamp: epochTime,
                status: isOnline
            }],

        }]
    })

    new_entry.save(function(error) {
        if (error) {
            console.log(error)
        }
        res.send({
            success: true
        })
    })
})

app.get('/updateTest/:teamName', (req, res, next) => {
        var name = req.params.teamName;
        var epochTime = Date.now();
        var error = 'New Error';
        sTeam.update({ name: name }, {
            '$set': {
                'ICMP_Linux1': {
                    timeStamp: epochTime,
                    status: false,
                    error: error.toString()
                }
            }
        }, function(err, affected, resp) {
            console.log('This response: ', resp);
        });
        res.send({
            This: 'Works'
        })
    })
    //Finished Works
app.get('/ICMP_ALL/:teamName', async(req, res, next) => {
    //var hostIn = req.params.host;
    var name = req.params.teamName;
    var epochTime = Date.now();
    for (let index = 0; index < teamIps.length; index++) {
        var hostIn = teamIps[index];
        const boxName = boxNames[index];
        var db_base = 'ICMP_';
        var db_index = db_base.concat(boxName);
        var result = await session.pingHost(hostIn, function(error, hostIn, sent, rcvd) {
            var ms = rcvd - sent;
            var db_index = db_base.concat(boxName).toString();
            if (error) {
                var db_base = 'ICMP_';
                var db_index = db_base.concat(boxName);
                var output = hostIn + ": " + error.toString()
                insert_entry(false, name, db_index, error.toString())
            } else {
                var db_base = 'ICMP_';
                var db_index = db_base.concat(boxName);
                var output = hostIn + ": Alive (ms=" + ms + ")"
                insert_entry(true, name, db_index)
            }
        });
    }
})

app.get('/SSH_All/:teamName', async(req, res, next) => {
        var name = req.params.teamName;
        var commandIn = "whoami";
        for (let index = 0; index < teamIps.length; index++) {
            var hostIn = testSSH[index];
            const boxName = boxNames[index];
            var db_base = 'SSH_';
            var db_index = db_base.concat(boxName).toString();
            var creds = await get_creds(db_index, name)
            if (creds) {
                ssh.connect({
                    host: hostIn,
                    username: creds["username"],
                    port: sshPort,
                    password: creds["password"],
                }).then(function() {
                    ssh.execCommand(commandIn, { cwd: '' }).then(function(result) {
                        var db_base = 'SSH_';
                        var db_index = db_base.concat(boxName).toString();
                        insert_entry(true, name, db_index)
                    })
                }).catch(function(error) {
                    var db_base = 'SSH_';
                    var db_index = db_base.concat(boxName).toString();
                    insert_entry(false, name, db_index, error.toString())
                });
            }

        }
        res.send({
            msg: 'SSH works'
        })
    })
    //Finsihed
app.get('/DNS_ALL/:teamName', async(req, res, next) => {
    var name = req.params.teamName;
    var epochTime = Date.now();
    for (let index = 0; index < teamIps.length; index++) {
        var hostIn = teamIps[index];
        const boxName = boxNames[index];
        var db_base = 'DNS_';
        var db_index = db_base.concat(boxName);
        dns.setServers([
            hostIn
        ]);
        dns.lookup(hostIn, function onLookup(err, addresses, family) {
            if (err) {
                var db_base = 'DNS_';
                var db_index = db_base.concat(boxName);
                insert_entry(false, name, db_index, error.toString())
            } else {
                var db_base = 'DNS_';
                var db_index = db_base.concat(boxName);
                insert_entry(true, name, db_index)
            }
        });
    }
    res.send({
        msg: 'DNS works'
    })
})

app.get('/SQL_ALL/:teamName', async(req, res, next) => {
    var name = req.params.teamName;
    var epochTime = Date.now();

    for (let index = 0; index < teamIps.length; index++) {
        var hostIn = teamIps[index];
        const boxName = boxNames[index];
        var db_base = 'MYSQL_';
        var db_index = db_base.concat(boxName);
        // var hostIn = req.params.host;
        // // var portIn = req.params.port;
        // var usernameIn = req.params.username;
        // var passwordIn = req.params.password;
        var creds = await get_creds(db_index, name)
        if (creds) {
            var con = mysql.createConnection({
                host: hostIn,
                user: creds["username"],
                password: creds["password"]
            });
            con.connect(function(err) {
                if (err) {
                    var db_index = db_base.concat(boxName);
                    insert_entry(false, name, db_index, error.toString())
                } else {
                    var db_index = db_base.concat(boxName);
                    insert_entry(true, name, db_index)
                }
            });
        }
    }
})

app.get('/AD_ALL/:teamName', async(req, res, next) => {
    var name = req.params.teamName;
    var epochTime = Date.now();

    for (let index = 0; index < teamIps.length; index++) {
        var hostIn = teamIps[index];
        const boxName = boxNames[index];
        var db_base = 'AD_';
        var db_index = db_base.concat(boxName);
        var ad = new ActiveDirectory(config);
        var creds = await get_creds(db_index, name)
        if (creds) {
            ad.authenticate(creds["username"] + "@" + hostIn, creds["password"], function(err, auth) {
                if (err) {
                    var db_index = db_base.concat(boxName);
                    insert_entry(false, name, db_index, err.toString())
                }

                if (auth) {
                    var db_index = db_base.concat(boxName);
                    insert_entry(true, name, db_index)
                } else {
                    var db_index = db_base.concat(boxName);
                    insert_entry(false, name, db_index, "auth error")
                }
            });
        }
    }
})

app.get('/FTP_ALL/:teamName', async(req, res, next) => {
    var name = req.params.teamName;
    var epochTime = Date.now();

    for (let index = 0; index < teamIps.length; index++) {
        var hostIn = teamIps[index];
        const boxName = boxNames[index];
        var db_base = 'FTP_';
        var db_index = db_base.concat(boxName);
        var creds = await get_creds(db_index, name)
        if (creds) {
            c.connect({
                host: hostIn,
                port: 25,
                user: creds["username"],
                password: creds["password"]
            });
            c.on('ready', function() {
                c.list(function(err, list) {
                    if (err) {
                        var db_index = db_base.concat(boxName);
                        insert_entry(false, name, db_index, err.toString())
                    } else {
                        var db_index = db_base.concat(boxName);
                        insert_entry(true, name, db_index)
                    }
                    c.end();
                });
            });
        }
    }
})

app.listen(process.env.PORT || 8082)