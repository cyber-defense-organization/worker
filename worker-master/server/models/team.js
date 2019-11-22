var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var teamSchema = new Schema({
     name: String,
     score: Number,
     services: 
          [{
               linuxICMP: [{
                    timeStamp: Number,
                    value: Boolean
               }],
               
          }]
});

var team = mongoose.model("team", teamSchema);
module.exports = team;
