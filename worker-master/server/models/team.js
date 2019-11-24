var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var teamSchema = new Schema({
     name: String,
     score: Number,
     services: 
          [{   
               // ICMP: [{
               //      timeStamp: {type: Date},
               //      status: {type: Boolean, default: false},
               //      error: String,
               //      speed: String
               // }],
               ICMP_Linux1: [{
                    timeStamp: {type: Date},
                    status: {type: Boolean, default: false},
                    error: String,
                    speed: String
               }],
               ICMP_Linux2: [{
                    timeStamp: {type: Date},
                    status: {type: Boolean, default: false},
                    error: String,
                    speed: String
               }],
               ICMP_Windows1: [{
                    timeStamp: {type: Date},
                    status: {type: Boolean, default: false},
                    error: String,
                    speed: String
               }],
               ICMP_Windows2: [{
                    timeStamp: {type: Date},
                    status: {type: Boolean, default: false},
                    error: String,
                    speed: String
               }],
               ICMP_98: [{
                    timeStamp: {type: Date},
                    status: {type: Boolean, default: false},
                    error: String,
                    speed: String
               }],
               
          }]
});

var team = mongoose.model("team", teamSchema);
module.exports = team;
