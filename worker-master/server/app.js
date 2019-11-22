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
//

// const mongodb_conn_module = require('./mongodbConnModule');
// var db = mongodb_conn_module.connect();

//dbdepends
var Team = require("./models/team")

//middleware if we get that far
// const ICMP = require('./middleware/ICMP')

app.get('/ICMP/:ipIn', async (req, res, next) => {
    var ipIn = req.params.ipIn;
    // console.log('ipAddr = ' + ipIn)
    var target = ipIn;
  
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

    // console.log(hostIn + ' : ' +  usernameIn + ' : ' + passwordIn)
    // try {
    //     ssh.connect({
    //         host: hostIn,
    //         username: usernameIn,
    //         port: portIn,
    //         password: passwordIn,
    //     }).then(function() {
    //         ssh.execCommand('ls', { cwd:'' }).then(function(result) {
    //             // console.log('STDOUT: ' + result.stdout)
    //             // console.log('STDERR: ' + result.stderr)
    //             res.send({
    //                 status: result.stdout
    //             })
    //         })
    //     })

    // }
    // catch(error) {
    //     console.log("meme: " + error);
    //     res.send({
    //         status: 'Nah b'
    //     })
    // }
    })

    

app.listen(process.env.PORT || 8081)