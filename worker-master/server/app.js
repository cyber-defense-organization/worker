var teamIp = "10.0.3."
var listenPort = 8084

var teamIps = []

for(i =1; i < 6; i++) {
  var end_octet = i + "0"
  teamIps.push(teamIp + end_octet)
}

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
var Request = require("request");
var mysql = require('mysql');
//ICMP
//var request = require('request');
var ping = require("net-ping");
const axios = require('axios');
var prop = require("./db_propate")
var ActiveDirectory = require('activedirectory');
var dns = require('dns');
var node_ssh = require('node-ssh')
var ActiveDirectory = require('activedirectory');
//dbdepends
var Team = require("./models/team")
var creds = require("./models/auth")
var sTeam = require("./models/sTeam")


const mongodb_conn_module = require('./mongodbConnModule');
var db = mongodb_conn_module.connect();
var ssh = new node_ssh()
const app = express()
var Client = require('ftp');
var c = new Client();

app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())

var options = {
    networkProtocol: ping.NetworkProtocol.IPv4,
    packetSize: 16,
    retries: 1,
    sessionId: (process.pid % 65535),
    timeout: 2000,
    ttl: 128
};
var session = ping.createSession(options);

var sshPort = 22;
var ftpPort = 25;
var httpPort = 80
var boxNames = [
    'Linux1',
    'Linux2',
    'Windows1',
    'Windows2',
    'Windows98',
]

function insert_entry(status, name, db_index, error = false) {
    var entry = {
        timeStamp: Date.now(),
        status: status,
    }
    if (error) {
        entry["error"] = error
    } else {
        sTeam.update({
            name: name
        }, {
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
    sTeam.update({
        name: name
    }, {
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
    const foundUser = await creds.findOne({
        name: teamName
    })
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


app.get('/ICMP_ALL/:teamName', async(req, res, next) => {
    //var hostIn = req.params.host;
    var name = req.params.teamName;
    var epochTime = Date.now();
    for (let index = 0; index < teamIps.length; index++) {
        var hostIn = teamIps[index];
        const boxName = boxNames[index];
        var result = await session.pingHost(hostIn, function(error, hostIn, sent, rcvd) {
            var ms = rcvd - sent;
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
    res.send({
        success: true
    })
})

app.get('/SSH_All/:teamName', async(req, res, next) => {
        var name = req.params.teamName;
        for (let index = 0; index < 2; index++) {
            var hostIn = teamIps[index];
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
                    var db_base = 'SSH_';
                    var db_index = db_base.concat(boxName).toString();
                    insert_entry(true, name, db_index)
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
    for (let index = 2; index < 3; index++) {
        var hostIn = teamIps[index];
        const boxName = boxNames[index];
        var db_base = 'DNS_';
        var db_index = db_base.concat(boxName);
        dns.setServers([
            hostIn
        ]);
	//console.log(dns.getServers())
        dns.resolve("google.com", function onLookup(err, addresses, family) {
            if (err) {
                var db_base = 'DNS_';
                var db_index = db_base.concat(boxName);
                insert_entry(false, name, db_index, err.toString())
            } else {
                var db_base = 'DNS_';
                var db_index = db_base.concat(boxName);
                console.log('address: %j family: IPv%s', addresses, family);
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

    for (let index = 1; index < 2; index++) {
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
                    insert_entry(false, name, db_index, err.toString())
                } else {
                    var db_index = db_base.concat(boxName);
                    insert_entry(true, name, db_index)
                }
            });
        }
    }
    res.send({
        msg: 'SQL works'
    })
})

app.get('/AD_ALL/:teamName', async(req, res, next) => {
    var name = req.params.teamName;
    var epochTime = Date.now();

    for (let index = 0; index < teamIps.length; index++) {
        var hostIn = teamIps[index];
        const boxName = boxNames[index];
        var db_base = 'AD_';
        var db_index = db_base.concat(boxName);
        var ad = new ActiveDirectory();
        var creds = await get_creds(db_index, name)
        if (creds) {
            ad.authenticate(creds["username"] + "@dotcom.local", creds["password"], function(err, auth) {
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
    res.send({
        msg: 'AD works'
    })
})

app.get('/WEB_ALL/:teamName', async(req, res, next) => {
    var name = req.params.teamName;
    var epochTime = Date.now();

    for (let index = 0; index < 1; index++)  {
        var hostIn = teamIps[index];
        const boxName = boxNames[index];
        var db_base = 'Web_';
        var db_index = db_base.concat(boxName);
        //axios.get("http://" + hostIn + ":" + httpPort, timeout=10)
        axios({
            method: 'get',
            url : "http://" + hostIn + ":" + httpPort + "/gddc/index.php",
            timeout: 5000
        })
        .then(response => {
            var db_index = db_base.concat(boxName);
            if(response.data.explanation.toLowerCase().search("connection")) {
                insert_entry(true, name, db_index)
                console.log(response.data.explanation)
            } else {
                insert_entry(false, name, db_index, "unable to find string")
            }
        })
        .catch(err => {
            var db_index = db_base.concat(boxName);
            insert_entry(false, name, db_index, err.toString())
        });
    }
    res.send({
        msg: 'Web works'
    })
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
                port: ftpPort,
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
    res.send({
        msg: 'FTP works'
    })
})

app.listen(process.env.PORT || listenPort)
