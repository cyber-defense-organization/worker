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

module.exports = {

    ICMP_CHECK: function(ipIn){
        console.log('running...')
        console.log(ipIn)
        var target = ipIn;
        var output = '';
        session.pingHost (target, function (error, target, sent, rcvd) {
            var ms = rcvd - sent;
            if (error)
                output = target.toString() +  ": " + error.toString ();
                // console.log (target + ": " + error.toString ());
            else
                output = target.toString() +  ": Alive (ms=" + ms.toString() + ")";
                //console.log (target + ": Alive (ms=" + ms + ")");
        });
        console.log('still running...')
        console.log(output + "<-- Output")
        return output;
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