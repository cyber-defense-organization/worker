const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')

const app = express()
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())

// const mongodb_conn_module = require('./mongodbConnModule');
// var db = mongodb_conn_module.connect();

//dbdepends
var Team = require("./models/team")

console.log('Hello');

var ping = require ("net-ping");

// Default options
var options = {
    networkProtocol: ping.NetworkProtocol.IPv4,
    packetSize: 16,
    retries: 1,
    sessionId: (process.pid % 65535),
    timeout: 2000,
    ttl: 128
};

var session = ping.createSession (options);



var target = "8.8.8.8";

session.pingHost (target, function (error, target, sent, rcvd) {
    var ms = rcvd - sent;
    if (error)
        console.log (target + ": " + error.toString ());
    else
        console.log (target + ": Alive (ms=" + ms + ")");
});