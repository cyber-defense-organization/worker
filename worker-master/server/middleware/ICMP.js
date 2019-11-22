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

module.exports = {

    ICMP_CHECK: function(){
        return 
    }

    // authorize: function(credentials, callback) {
    //   const {client_secret, client_id, redirect_uris} = credentials.installed;
    //   const oAuth2Client = new google.auth.OAuth2(
    //       client_id, client_secret, redirect_uris[0]);
  
    //   // Check if we have previously stored a token.
    //   fs.readFile(TOKEN_PATH, (err, token) => {
    //     if (err) return getNewToken(oAuth2Client, callback);
    //     oAuth2Client.setCredentials(JSON.parse(token));
    //     callback(oAuth2Client);
    //   });
    // }
  };