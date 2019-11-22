const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')

const app = express()
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())

//Services deps

//ICMP
var ping = require ("net-ping");
var options = {
    networkProtocol: ping.NetworkProtocol.IPv4,
    packetSize: 16,
    retries: 1,
    sessionId: (process.pid % 65535),
    timeout: 2000,
    ttl: 128
};
var session = ping.createSession (options);
//DNS

//SSH
var node_ssh = require('node-ssh')
var ssh = new node_ssh()
//DB -- SQL
//require the module
var sql = require('sql');
 
//(optionally) set the SQL dialect
sql.setDialect('postgres');
//possible dialects: mssql, mysql, postgres (default), sqlite
var user = sql.define({
    name: 'user',
    columns: ['id', 'name', 'email', 'lastLogin']
  });
//FTP
var Client = require('ftp');
 
var c = new Client();
c.on('ready', function() {
c.list(function(err, list) {
    if (err) throw err;
    console.dir(list);
    c.end();
    });
});
//WinRM
var winrm = require('nodejs-winrm');
//AD (active directory) //doesnt work
var ActiveDirectory = require('activedirectory');
var config = { url: 'ldap://dc.domain.com',
               baseDN: 'dc=domain,dc=com',
               username: 'username@domain.com',// might not need these
               password: 'password' } //might not need these
var ad = new ActiveDirectory(config);

const mongodb_conn_module = require('./mongodbConnModule');
var db = mongodb_conn_module.connect();

//dbdepends
var Team = require("./models/team")

//middleware if we get that far
// const ICMP = require('./middleware/ICMP')

app.get('/addTeam/:name' , (req,res,next) => {
    var epochTime = Date.now();
    var name = req.params.name;
    var score = 0;
    var isOnline = true;
    var new_entry = new Team({
        name: name,
           score: score,
           services: 
                [{
                     ICMP: [{
                          timeStamp: epochTime,
                          status: isOnline
                     }],
                     
                }]
      })
      
      new_entry.save(function (error) {
        if (error) {
          console.log(error)
        }
        res.send({
          success: true
        })
      })
})

app.get('/addICMP/:status/:name' , (req,res,next) => {
    var curSta = req.params.status;
    var epochTime = Date.now();
    var name = req.params.name;
    var isOnline = true;
    //var icmpUpdate = { timeStamp: epochTime, status: isOnline };
    // Team.services.push(icmpUpdate);
    // Team.save(done);
    Team.findOneAndUpdate(
    { name: name }, 
    //{$push: { services:[{ ICMP: [{ timeStamp: epochTime, status: isOnline}] }] }},
    {$push: {'services.0.ICMP':{ timeStamp: epochTime, status: isOnline} }},
    // { $push: { 'services.0.ICMP.0': icmpUpdate}},
    function (error, success) {
            if (error) {
                console.log(error);
                res.send({
                    error: error
                })
            } else {
                console.log(success);
                res.send({
                    success: success
                })
            }
        });
})

app.get('/ICMP/:host', async (req, res, next) => {
    var hostIn = req.params.host;
    // console.log('ipAddr = ' + ipIn)
    var target = hostIn;
  
    const result = await session.pingHost(target, function (error, target, sent, rcvd) {
        var ms = rcvd - sent;
        if (error){
            //output = target.toString() +  ": " + error.toString ();
            console.log (target + ": " + error.toString ());
            var output = target + ": " + error.toString ()
            res.send({
                result: output
            })
        }
        else{
            //output = target.toString() +  ": Alive (ms=" + ms.toString() + ")";
            console.log (target + ": Alive (ms=" + ms + ")");
            var output = target + ": Alive (ms=" + ms + ")"
            res.send({
                result: output
            })
        }
    });
    
})

app.get('/SSH/:host/:port/:username/:password/:command', (req,res,next) => {
    var hostIn = req.params.host;
    var portIn = req.params.port;
    var usernameIn = req.params.username;
    var passwordIn = req.params.password;
    var commandIn = req.params.command;

    ssh.connect({
                host: hostIn,
                username: usernameIn,
                port: portIn,
                password: passwordIn,
            }).then(function() {
                ssh.execCommand(commandIn, { cwd:'' }).then(function(result) {
                    // console.log('STDOUT: ' + result.stdout)
                    // console.log('STDERR: ' + result.stderr)
                    res.send({
                        status: result.stdout
                    })
                })
            }).catch(function(error) {
                console.error(error);
                res.send({
                    status: 'Nah B no ssh'
                })
              });
})

app.get('/FTP/:host/:port/:username/:password', (req , res , next) => {
    var hostIn = req.params.host;
    var portIn = req.params.port;
    var usernameIn = req.params.username;
    var passwordIn = req.params.password;
    //var commandIn = req.params.command; //add this
    c.connect({
        host: hostIn,
        port: portIn,
        user: usernameIn,
        pass: passwordIn
    });
})

app.get('/SQL/:host/:port/:username/:password', (req , res , next) => {
    var hostIn = req.params.host;
    var portIn = req.params.port;
    var usernameIn = req.params.username;
    var passwordIn = req.params.password;
    //var commandIn = req.params.command; //add this
    var query = user.select(user.star()).from(user).toQuery();
    console.log(query.text); //SELECT "user".* FROM "user"
})

app.get('/WINRM/:host/:port/:username/:password', async (req , res , next) => {
    var hostIn = req.params.host;
    var portIn = req.params.port;
    var usernameIn = req.params.username;
    var passwordIn = req.params.password;
    //var commandIn = req.params.command; //add this
    var userName = usernameIn;
    var password = passwordIn;
    var _host = hostIn;
    var _port = portIn;

    var auth = 'Basic' + Buffer.from(userName + ":" + password, 'utf8').toString('base64');
    var params = {
        host: _host,
        port: _port,
        path: '/wsman' //This might not be needed
    };
    params['auth'] = auth;

    //Get the Shell ID
    params['shellId']= await winrm.shell.doCreateShell(params);

    // Execute Command1
    params['command'] = 'ipaddress /all';
    params['commandId'] = await winrm.command.doExecuteCommand(params);
    var result1= await winrm.command.doReceiveOutput(params);

    // Execute Command2
    params['command'] = 'mkdir D:\\winrmtest001';
    params['commandId'] = await winrm.command.doExecuteCommand(params);
    var result2= await winrm.command.doReceiveOutput(params);

    // Close the Shell
    await winrm.shell.doDeleteShell(params);
})  

app.get('/AD/:host/:port/:username/:password', async (req , res , next) => {
    var hostIn = req.params.host;
    var portIn = req.params.port;
    var usernameIn = req.params.username;
    var passwordIn = req.params.password;
    //var commandIn = req.params.command; //add this
    var username = usernameIn;
    var password = passwordIn;
    
    ad.authenticate(username, password, function(err, auth) {
    if (err) {
        console.log('ERROR: '+JSON.stringify(err));
        return;
    }
    
    if (auth) {
        console.log('Authenticated!');
    }
    else {
        console.log('Authentication failed!');
    }
    });
})  

app.listen(process.env.PORT || 8081)