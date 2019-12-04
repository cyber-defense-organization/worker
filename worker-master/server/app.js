const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
var Request = require("request");
var mysql = require('mysql');
var ActiveDirectory = require('activedirectory');
const app = express()
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
// npm install mysql

//FTP
var Client = require('ftp');
var c = new Client();

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
var sTeam = require("./models/sTeam")

//middleware if we get that far
// const ICMP = require('./middleware/ICMP')

//This will get added to admin panel on Backend
app.get('/NaddTeam/:name' , (req,res,next) => {
    var epochTime = Date.now();
    var name = req.params.name;
    var score = 0;
    var new_entry = new sTeam({
        name: name,
        password: 'bb123#123',
        score: score,
        // ICMP_Score: Number,
        // SSH_Score: Number,
        // HTTP_Score: Number,
        // DNS_Score: Number,
        // DB_Score: Number,
        // FTP_Score: Number,
        AD_Linux1: {
            timeStamp: epochTime,
            status: false,
            error: 'na'
        },
        AD_Linux2: {
            timeStamp: epochTime,
            status: false,
            error: 'na'
        },
        AD_Windows1:  {
            timeStamp: epochTime,
            status: false,
            error: 'na'
        },
        AD_Windows2: {
            timeStamp: epochTime,
            status: false,
            error: 'na'
        } ,
        AD_Windows98:  {
            timeStamp: epochTime,
            status: false,
            error: 'na'
        } ,
        // MYSQL
        MYSQL_Linux1:  {
            timeStamp: epochTime,
            status: false,
            error: 'na'
        } ,
        MYSQL_Linux2:  {
            timeStamp: epochTime,
            status: false,
            error: 'na'
        } ,
        MYSQL_Windows1:  {
            timeStamp: epochTime,
            status: false,
            error: 'na'
        } ,
        MYSQL_Windows2:  {
            timeStamp: epochTime,
            status: false,
            error: 'na'
        } ,
        MYSQL_Windows98:  {
            timeStamp: epochTime,
            status: false,
            error: 'na'
        } ,
        // FTP
        FTP_Linux1:  {
            timeStamp: epochTime,
            status: false,
            error: 'na'
        } ,
        FTP_Linux2:  {
            timeStamp: epochTime,
            status: false,
            error: 'na'
        } ,
        FTP_Windows1:  {
            timeStamp: epochTime,
            status: false,
            error: 'na'
        } ,
        FTP_Windows2:  {
            timeStamp: epochTime,
            status: false,
            error: 'na'
        } ,
        FTP_Windows98:  {
            timeStamp: epochTime,
            status: false,
            error: 'na'
        } ,
        //ICMP
        ICMP_Linux1:  {
            timeStamp: epochTime,
            status: false,
            error: 'na',
            speed: 'na'
        } ,
        ICMP_Linux2:  {
            timeStamp: epochTime,
            status: false,
            error: 'na',
            speed: 'na'
        } ,
        ICMP_Windows1:  {
            timeStamp: epochTime,
            status: false,
            error: 'na',
            speed: 'na'
        } ,
        ICMP_Windows2:  {
            timeStamp: epochTime,
            status: false,
            error: 'na',
            speed: 'na'
        } ,
        ICMP_98:  {
            timeStamp: epochTime,
            status: false,
            error: 'na',
            speed: 'na'
        } ,

        //SSH
        SSH_Linux1:  {
            timeStamp: epochTime,
            status: false,
            error: 'na'
        } ,
        SSH_Linux2:  {
            timeStamp: epochTime,
            status: false,
            error: 'na'
        } ,
        SSH_Windows1:  {
            timeStamp: epochTime,
            status: false,
            error: 'na'
        } ,
        SSH_Windows2:  {
            timeStamp: epochTime,
            status: false,
            error: 'na'
        } ,
        SSH_98:  {
            timeStamp: epochTime,
            status: false,
            error: 'na'
        } ,

        //DNS 
        DNS_Linux1:  {
            timeStamp: epochTime,
            status: false,
            error: 'na'
        } ,
        DNS_Linux2:  {
            timeStamp: epochTime,
            status: false,
            error: 'na'
        } ,
        DNS_Windows1:  {
            timeStamp: epochTime,
            status: false,
            error: 'na'
        } ,
        DNS_Windows2:  {
            timeStamp: epochTime,
            status: false,
            error: 'na'
        } ,
        DNS_98:  {
            timeStamp: epochTime,
            status: false,
            error: 'na'
        } ,
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

app.get('/updateTest/:teamName' , (req,res,next) => {
    var name = req.params.teamName;
    var epochTime = Date.now();
    var error = 'New Error';
    sTeam.update({ name: name }, 
        {'$set': {'ICMP_Linux1':{
            timeStamp: epochTime ,
            status: false ,
            error: error.toString()
        }}
     }, function(err, affected, resp) {
       console.log('This response: ' , resp);
    });
    res.send({
        This: 'Works'
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
        var db_base = 'ICMP_';
        var db_index = db_base.concat(boxName);
        var result = await session.pingHost(hostIn, function (error, hostIn, sent, rcvd) {
        var ms = rcvd - sent;
        var db_index = db_base.concat(boxName).toString();
            if (error){
                var output = hostIn + ": " + error.toString()
                sTeam.update({ name: name }, 
                    {'$set': { [db_index] :{
                        timeStamp: epochTime ,
                        status: false ,
                        error: error.toString()
                    }}
                 }, function(err, affected, resp) {
                   //console.log('This response: ' , resp);
                })
            }
            else{
                var output = hostIn + ": Alive (ms=" + ms + ")"
                sTeam.update({ name: name }, 
                    {'$set': { [db_index] :{
                        timeStamp: epochTime ,
                        status: true ,
                        speed: ms

                    }}
                 }, function(err, affected, resp) {
                   //console.log('This response: ' , resp);
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
app.get('/OICMP_ALL/:teamName' , async (req, res, next) =>{
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

app.get('/SQL_ALL/:teamName' , async (req, res, next) => {
    var name = req.params.teamName;
    var epochTime = Date.now();

    for (let index = 0; index < teamIps.length; index++) {
        var hostIn = teamIps[index];
        const boxName = boxNames[index];
        var db_base = 'services.0.MYSQL_';
        var db_index = db_base.concat(boxName);
        // var hostIn = req.params.host;
        // // var portIn = req.params.port;
        // var usernameIn = req.params.username;
        // var passwordIn = req.params.password;
        var con = mysql.createConnection({
            host: hostIn,
            user: "root",
            password: "123"
        });
        con.connect(function(err) {
            if (err){
                console.log(err)
                Team.findOneAndUpdate(
                    { name: name }, 
                    {$push: {[db_index] :{ timeStamp: epochTime , status: false, error: err} }},
                    function(err,suc){
                        if(err){
                            console.log("mongodb mysql error:" + err)
                        }
                });
            } else {
                Team.findOneAndUpdate(
                    { name: name }, 
                    {$push: {[db_index] :{ timeStamp: epochTime , status: true} }},
                    function(err,suc){
                        if(err){
                            console.log("mongodb mysql error:" + err)
                    }
                });
            }
        });
    }
})

app.get('/AD_ALL/:teamName' , async (req, res, next) => {
    var name = req.params.teamName;
    var epochTime = Date.now();

    for (let index = 0; index < teamIps.length; index++) {
        var hostIn = teamIps[index];
        const boxName = boxNames[index];
        var db_base = 'services.0.AD_';
        var db_index = db_base.concat(boxName);
        var ad = new ActiveDirectory(config);
        var username = 'test@'+ hostIn;
        var password = 'password';
         
        ad.authenticate(username, password, function(err, auth) {
          if (err) {
            Team.findOneAndUpdate(
                { name: name }, 
                {$push: {[db_index] :{ timeStamp: epochTime , status: false, error : err} }},
                function(err,suc){
                    if(err){
                        console.log("mongodb ad error:" + err)
                }
            });
            return;
          }
          
          if (auth) {
            Team.findOneAndUpdate(
                { name: name }, 
                {$push: {[db_index] :{ timeStamp: epochTime , status: true} }},
                function(err,suc){
                    if(err){
                        console.log("mongodb ad error:" + err)
                }
            });
          }
          else {
            Team.findOneAndUpdate(
                { name: name }, 
                {$push: {[db_index] :{ timeStamp: epochTime , status: false, error : "auth failure"} }},
                function(err,suc){
                    if(err){
                        console.log("mongodb ad error:" + err)
                }
            });
          }
        });
    }
})

app.get('/FTP_ALL/:teamName' , async (req, res, next) => {
    var name = req.params.teamName;
    var epochTime = Date.now();

    for (let index = 0; index < teamIps.length; index++) {
        var hostIn = teamIps[index];
        const boxName = boxNames[index];
        var db_base = 'services.0.FTP_';
        var db_index = db_base.concat(boxName);
        c.connect({
            host: hostIn,
            port: 25,
            user: "anonymouse",
            password: "anonymouse"
        });
        c.on('ready', function() {
            c.list(function(err, list) {
                if (err){
                    Team.findOneAndUpdate(
                        { name: name }, 
                        {$push: {[db_index] :{ timeStamp: epochTime , status: false, error: err} }},
                        function(err,suc){
                            if(err){
                                console.log("mongodb ftp error:" + err)
                            }
                    });
                    console.log(err)
                } else{
                    Team.findOneAndUpdate(
                        { name: name }, 
                        {$push: {[db_index] :{ timeStamp: epochTime , status: true} }},
                        function(err,suc){
                            if(err){
                                console.log("mongodb ftp error:" + err)
                        }
                    });
                }
                c.end();
            });
        });
    }
}) 

app.listen(process.env.PORT || 8082)