const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')

const app = express()
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())

//Services deps
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

// const mongodb_conn_module = require('./mongodbConnModule');
// var db = mongodb_conn_module.connect();

//dbdepends
var Team = require("./models/team")

//middleware if we get that far
// const ICMP = require('./middleware/ICMP')

app.get('/test/:ipIn', (req, res, next) => {
    var ipIn = req.params.ipIn;
    // console.log('ipAddr = ' + ipIn)
    var target = ipIn;
        var output = '';
        session.pingHost (target, function (error, target, sent, rcvd) {
            var ms = rcvd - sent;
            if (error){
                //output = target.toString() +  ": " + error.toString ();
                console.log (target + ": " + error.toString ());
            }
            else{
                //output = target.toString() +  ": Alive (ms=" + ms.toString() + ")";
                console.log (target + ": Alive (ms=" + ms + ")");
            }
        });
})


app.listen(process.env.PORT || 8081)