const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')

const app = express()
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())

//Team IP Info
var teamIps = [
    '8.8.8.8',
    '8.8.8.9',
    '8.8.8.8',
    '8.8.8.8',
    '8.8.8.8',
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

app.get('/ICMP_ALLo/:teamName' , async (req, res, next) =>{
    //var hostIn = req.params.host;
    var name = req.params.teamName;
    var epochTime = Date.now();

    for (let index = 0; index < teamIps.length; index++) {
        var hostIn = teamIps[index];
        const boxName = boxNames[index];
    }

    var result = await session.pingHost(hostIn, function (error, hostIn, sent, rcvd) {
        var ms = rcvd - sent;
        console.log(typeof db_index)
        if (error){
            var output = hostIn + ": " + error.toString()
            Team.findOneAndUpdate(
                { name: name }, 
                {$push: {db_index :{ timeStamp: epochTime , status: false , error: error.toString()} }},
                function(err,suc){
                    if(err){
                        console.log(err)
                    }
                    else{
                        console.log(hostIn + ' : ' + db_index + " : " + output)
                    }
                });
        }
        else{
            var output = hostIn + ": Alive (ms=" + ms + ")"
            Team.findOneAndUpdate(
                { name: name }, 
                {$push: {db_index :{ timeStamp: epochTime , status: true , speed: ms} }},
                function(err,suc){
                    if(err){
                        console.log(err)
                    }else{
                        console.log(hostIn + ' : ' + db_index + " : " + output)
                    }
                });
        }
    });
  
    // This for loop needs fixin
    
    for (let index = 0; index < teamIps.length; index++) {
        var hostIn = teamIps[index];
        const boxName = boxNames[index];
        const liTest = 'services.0.ICMP_Linux1'
        var db_base = 'services.0.ICMP_';
        var db_index = db_base.concat(boxName);
        console.log('Inital : ' + boxName)

        //This should work and makes life easier but I cant append the db_index string into the mongoose push call

        var result = await session.pingHost(hostIn, function (error, hostIn, sent, rcvd) {
            var ms = rcvd - sent;
            var db_base = 'services.0.ICMP_';
            var db_index = db_base.concat(boxName).toString();
            console.log(typeof db_index)
            if (error){
                var output = hostIn + ": " + error.toString()
                Team.findOneAndUpdate(
                    { name: name }, 
                    {$push: {db_index :{ timeStamp: epochTime , status: false , error: error.toString()} }},
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
                    {$push: {db_index :{ timeStamp: epochTime , status: true , speed: ms} }},
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

app.get('/ICMP_ALL/:teamName', async (req,res,next) => {
    var name = req.params.teamName;
    var epochTime = Date.now();
    
    var hostIn1 = teamIps[0];
    var hostIn2 = teamIps[1];
    var hostIn3 = teamIps[2];
    var hostIn4 = teamIps[3];
    var hostIn5 = teamIps[4];

    console.log('t1')

    //Call 1
    var result = await session.pingHost(hostIn1, function (error, hostIn1, sent, rcvd) {
        var ms = rcvd - sent;
        if (error){
            var output = hostIn1 + ": " + error.toString()
            Team.findOneAndUpdate(
                { name: name }, 
                {$push: {'services.0.ICMP_Linux1' :{ timeStamp: epochTime , status: false , error: error.toString()} }},
                function(err,suc){
                    if(err){
                        console.log(err)
                    }
                    else{
                        //console.log(hostIn1 + ' : ' + db_index + " : " + output)
                    }
                });
        }
        else{
            var output = hostIn1 + ": Alive (ms=" + ms + ")"
            Team.findOneAndUpdate(
                { name: name }, 
                {$push: {'services.0.ICMP_Linux1' :{ timeStamp: epochTime , status: true , speed: ms} }},
                function(err,suc){
                    if(err){
                        console.log(err)
                    }else{
                        //console.log(hostIn1 + ' : ' + db_index + " : " + output)
                    }
                });
        }
    });

    //Call 2
    var result = await session.pingHost(hostIn2, function (error, hostIn2, sent, rcvd) {
        var ms = rcvd - sent;
        if (error){
            var output = hostIn2 + ": " + error.toString()
            Team.findOneAndUpdate(
                { name: name }, 
                {$push: {'services.0.ICMP_Linux2' :{ timeStamp: epochTime , status: false , error: error.toString()} }},
                function(err,suc){
                    if(err){
                        console.log(err)
                    }
                    else{
                        //console.log(hostIn2 + ' : ' + db_index + " : " + output)
                    }
                });
        }
        else{
            var output = hostIn2 + ": Alive (ms=" + ms + ")"
            Team.findOneAndUpdate(
                { name: name }, 
                {$push: {'services.0.ICMP_Linux2' :{ timeStamp: epochTime , status: true , speed: ms} }},
                function(err,suc){
                    if(err){
                        console.log(err)
                    }else{
                        //console.log(hostIn2 + ' : ' + db_index + " : " + output)
                    }
                });
        }
    });

    //Call 3
    var result = await session.pingHost(hostIn3, function (error, hostIn3, sent, rcvd) {
        var ms = rcvd - sent;
        if (error){
            var output = hostIn3 + ": " + error.toString()
            Team.findOneAndUpdate(
                { name: name }, 
                {$push: {'services.0.ICMP_Windows1' :{ timeStamp: epochTime , status: false , error: error.toString()} }},
                function(err,suc){
                    if(err){
                        console.log(err)
                    }
                    else{
                        //console.log(hostIn3 + ' : ' + db_index + " : " + output)
                    }
                });
        }
        else{
            var output = hostIn3 + ": Alive (ms=" + ms + ")"
            Team.findOneAndUpdate(
                { name: name }, 
                {$push: {'services.0.ICMP_Windows1' :{ timeStamp: epochTime , status: true , speed: ms} }},
                function(err,suc){
                    if(err){
                        console.log(err)
                    }else{
                        //console.log(hostIn3 + ' : ' + db_index + " : " + output)
                    }
                });
        }
    });

    //Call 4
    var result = await session.pingHost(hostIn4, function (error, hostIn4, sent, rcvd) {
        var ms = rcvd - sent;
        if (error){
            var output = hostIn4 + ": " + error.toString()
            Team.findOneAndUpdate(
                { name: name }, 
                {$push: {'services.0.ICMP_Windows2' :{ timeStamp: epochTime , status: false , error: error.toString()} }},
                function(err,suc){
                    if(err){
                        console.log(err)
                    }
                    else{
                        //console.log(hostIn4 + ' : ' + db_index + " : " + output)
                    }
                });
        }
        else{
            var output = hostIn4 + ": Alive (ms=" + ms + ")"
            Team.findOneAndUpdate(
                { name: name }, 
                {$push: {'services.0.ICMP_Windows2' :{ timeStamp: epochTime , status: true , speed: ms} }},
                function(err,suc){
                    if(err){
                        console.log(err)
                    }else{
                        //console.log(hostIn4 + ' : ' + db_index + " : " + output)
                    }
                });
        }
    });

    //Call 5
    var result = await session.pingHost(hostIn5, function (error, hostIn5, sent, rcvd) {
        var ms = rcvd - sent;
        if (error){
            var output = hostIn5 + ": " + error.toString()
            Team.findOneAndUpdate(
                { name: name }, 
                {$push: {'services.0.ICMP_98' :{ timeStamp: epochTime , status: false , error: error.toString()} }},
                function(err,suc){
                    if(err){
                        console.log(err)
                    }
                    else{
                        //console.log(hostIn5 + ' : ' + db_index + " : " + output)
                    }
                });
        }
        else{
            var output = hostIn5 + ": Alive (ms=" + ms + ")"
            Team.findOneAndUpdate(
                { name: name }, 
                {$push: {'services.0.ICMP_98' :{ timeStamp: epochTime , status: true , speed: ms} }},
                function(err,suc){
                    if(err){
                        console.log(err)
                    }else{
                        //console.log(hostIn5 + ' : ' + db_index + " : " + output)
                    }
                });
        }
    });
    res.send({
        msg: 'Jank version but it works'
    })

    
})
app.get('/ICMP/:host/:teamName', async (req, res, next) => {
    var hostIn = req.params.host;
    var name = req.params.teamName;
    var epochTime = Date.now();
  
    const result = await session.pingHost(hostIn, function (error, hostIn, sent, rcvd) {
        var ms = rcvd - sent;
        if (error){
            // output = target.toString() +  ": " + error.toString ();
            // console.log (hostIn + ": " + error.toString ());
            var output = hostIn + ": " + error.toString()
            Team.findOneAndUpdate(
                { name: name }, 
                {$push: {'services.0.ICMP':{ timeStamp: epochTime , status: false , error: error.toString()} }},
                function(err,suc){
                    if(err){
                        console.log(err)
                    }
                });
            res.send({
                result: output
            })
        }
        else{
            // output = target.toString() +  ": Alive (ms=" + ms.toString() + ")";
            // console.log (hostIn + ": Alive (ms=" + ms + ")");
            var output = hostIn + ": Alive (ms=" + ms + ")"
            Team.findOneAndUpdate(
                { name: name }, 
                {$push: {'services.0.ICMP':{ timeStamp: epochTime , status: true , speed: ms} }},
                function(err,suc){
                    if(err){
                        console.log(err)
                    }
                });
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