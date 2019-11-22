var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var teamSchema = new Schema({
     name: String,
     score: Number,
     services: 
          [{
               ICMP: [{
                    timeStamp: Number,
                    status: Boolean //Future add up and down
               }],
               
          }]
});

var team = mongoose.model("team", teamSchema);
module.exports = team;
