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

const ICMP = require('./middleware/ICMP')

var tIn = '8.8.8.8'

app.use('/test', (req, res, next) => {
    var test = ICMP.ICMP_CHECK(tIn)
    res.send({
        out: test
    })
})

var test = ICMP.ICMP_CHECK(tIn)

console.log('working');
console.log(test);

app.listen(process.env.PORT || 8081)