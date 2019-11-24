const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')

const app = express()
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())

//Team IP Info
var sshPort = 2220;
var teamIps = [
    '8.8.8.8',
    '8.8.8.9',
    '8.8.8.822',
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
var dns = require('dns');

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
//Finished Works
app.get('/ICMP_ALL/:teamName' , async (req, res, next) =>{
    //var hostIn = req.params.host;
    var name = req.params.teamName;
    var epochTime = Date.now();
  
    
    for (let index = 0; index < teamIps.length; index++) {
        var hostIn = teamIps[index];
        const boxName = boxNames[index];
        var db_base = 'services.0.ICMP_';
        var db_index = db_base.concat(boxName);
        var result = await session.pingHost(hostIn, function (error, hostIn, sent, rcvd) {
        var ms = rcvd - sent;
        var db_base = 'services.0.ICMP_';
        var db_index = db_base.concat(boxName).toString();
            if (error){
                var output = hostIn + ": " + error.toString()
                Team.findOneAndUpdate(
                    { name: name }, 
                    {$push: {[db_index] :{ timeStamp: epochTime , status: false , error: error.toString()} }},
                    function(err,suc){
                        if(err){
                            console.log(err)
                        }
                        else{
                            console.log(hostIn + ' : ' + db_index + " : " + output)
                        }
                    });
                // res.send({
                //     result: output
                // })
            }
            else{
                var output = hostIn + ": Alive (ms=" + ms + ")"
                Team.findOneAndUpdate(
                    { name: name }, 
                    {$push: {[db_index] :{ timeStamp: epochTime , status: true , speed: ms} }},
                    function(err,suc){
                        if(err){
                            console.log(err)
                        }else{
                            console.log(hostIn + ' : ' + db_index + " : " + output)
                        }
                    });
                // res.send({
                //     result: output
                // })
            }
        });
    }
    res.send({
        debug: 'This works'
    })
})
//Finished works
app.get('/SSH_All/:teamName/:username/:password/:command', async (req,res,next) => {
    var name = req.params.teamName;
    var epochTime = Date.now();
    var usernameIn = req.params.username;
    var passwordIn = req.params.password;
    var commandIn = req.params.command;

    for (let index = 0; index < teamIps.length; index++) {
        var hostIn = testSSH[index];
        const boxName = boxNames[index];
        // var db_base = 'services.0.SSH_';
        // var db_index = db_base.concat(boxName);
        //console.log('Init : ' + db_index)
        ssh.connect({
            host: hostIn,
            username: usernameIn,
            port: sshPort,
            password: passwordIn,
        }).then(function() {
            ssh.execCommand(commandIn, { cwd:'' }).then(function(result) {
                var db_base = 'services.0.SSH_';
                var db_index = db_base.concat(boxName);
                //console.log(db_index)
                Team.findOneAndUpdate(
                    { name: name }, 
                    {$push: {[db_index] :{ timeStamp: epochTime , status: true } }},
                    function(err,suc){
                        if(err){
                            console.log(err)
                        }
                    });
                // res.send({
                //     status: result.stdout
                // })
            })
        }).catch(function(error) {
            var db_base = 'services.0.SSH_';
            var db_index = db_base.concat(boxName);
            Team.findOneAndUpdate(
                { name: name }, 
                {$push: {[db_index] :{ timeStamp: epochTime , status: false, error: error.toString() } }},
                function(err,suc){
                    if(err){
                        console.log(err)
                    }
                });
            // console.error(error);
            // res.send({
            //     status: 'Nah B no ssh'
            // })
          });

    }
    res.send({
        msg: 'SSH works'
    })
})
//Finsihed
app.get('/DNS_ALL/:teamName' , async (req, res, next) => {
    var name = req.params.teamName;
    var epochTime = Date.now();

    for (let index = 0; index < teamIps.length; index++) {
        var hostIn = teamIps[index];
        const boxName = boxNames[index];
        dns.lookup(hostIn, function onLookup(err, addresses, family) {
            if(err){
                var db_base = 'services.0.DNS_';
                var db_index = db_base.concat(boxName);
                Team.findOneAndUpdate(
                    { name: name }, 
                    {$push: {[db_index] :{ timeStamp: epochTime , status: false , error: err.toString()} }},
                    function(err,suc){
                        if(err){
                            console.log(err)
                        }
                    });
            }else{
                var db_base = 'services.0.DNS_';
                var db_index = db_base.concat(boxName);
                Team.findOneAndUpdate(
                    { name: name }, 
                    {$push: {[db_index] :{ timeStamp: epochTime , status: true} }},
                    function(err,suc){
                        if(err){
                            console.log(err)
                        }
                    });
            } 
          });
    }
    res.send({
        msg: 'DNS works'
    })
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