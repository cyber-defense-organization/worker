var epochTime = Date.now();
var score = 0;


var default_user = "cdo";
var default_password = "bb123#123"

module.exports = {
    sAuth_Prop(teamName) {
        return {
            name: teamName,
            AD_Linux1_Creds: {
                username: default_user,
                password: default_password

            },
            AD_Linux2_Creds: {
                username: default_user,
                password: default_password

            },
            AD_Windows1_Creds: {
                username: default_user,
                password: default_password

            },
            AD_Windows2_Creds: {
                username: default_user,
                password: default_password

            },
            AD_Windows98_Creds: {
                username: default_user,
                password: default_password

            },
            // MYSQL
            MYSQL_Linux1_Creds: {
                username: default_user,
                password: default_password

            },
            MYSQL_Linux2_Creds: {
                username: default_user,
                password: default_password

            },
            MYSQL_Windows1_Creds: {
                username: default_user,
                password: default_password

            },
            MYSQL_Windows2_Creds: {
                username: default_user,
                password: default_password

            },
            MYSQL_Windows98_Creds: {
                username: default_user,
                password: default_password

            },
            // FTP
            FTP_Linux1_Creds: {
                username: default_user,
                password: default_password

            },
            FTP_Linux2_Creds: {
                username: default_user,
                password: default_password

            },
            FTP_Windows1_Creds: {
                username: default_user,
                password: default_password

            },
            FTP_Windows2_Creds: {
                username: default_user,
                password: default_password

            },
            FTP_Windows98_Creds: {
                username: default_user,
                password: default_password

            },
            //ICMP
            ICMP_Linux1_Creds: {
                username: default_user,
                password: default_password,

            },
            ICMP_Linux2_Creds: {
                username: default_user,
                password: default_password,

            },
            ICMP_Windows1_Creds: {
                username: default_user,
                password: default_password,

            },
            ICMP_Windows2_Creds: {
                username: default_user,
                password: default_password,

            },
            ICMP_Windows98: {
                username: default_user,
                password: default_password,

            },

            //SSH
            SSH_Linux1_Creds: {
                username: default_user,
                password: default_password

            },
            SSH_Linux2_Creds: {
                username: default_user,
                password: default_password

            },
            SSH_Windows1_Creds: {
                username: default_user,
                password: default_password

            },
            SSH_Windows2_Creds: {
                username: default_user,
                password: default_password

            },
            SSH_Windows98: {
                username: default_user,
                password: default_password

            },

            //DNS 
            DNS_Linux1_Creds: {
                username: default_user,
                password: default_password

            },
            DNS_Linux2_Creds: {
                username: default_user,
                password: default_password

            },
            DNS_Windows1_Creds: {
                username: default_user,
                password: default_password

            },
            DNS_Windows2_Creds: {
                username: default_user,
                password: default_password

            },
            DNS_Windows98: {
                username: default_user,
                password: default_password

            }
        }
    },
    sTeam_Prop(name) {
        return {
            name: name,
            password: 'bb123#123',
            score: score,
            shopScore: score,
            AD_Linux1: {
                timeStamp: epochTime,
                status: false,
                error: 'na'
            },
            AD_Linux2: {
                timeStamp: epochTime,
                status: false,
                error: 'na'
            },
            AD_Windows1: {
                timeStamp: epochTime,
                status: false,
                error: 'na'
            },
            AD_Windows2: {
                timeStamp: epochTime,
                status: false,
                error: 'na'
            },
            AD_Windows98: {
                timeStamp: epochTime,
                status: false,
                error: 'na'
            },
            // MYSQL
            MYSQL_Linux1: {
                timeStamp: epochTime,
                status: false,
                error: 'na'
            },
            MYSQL_Linux2: {
                timeStamp: epochTime,
                status: false,
                error: 'na'
            },
            MYSQL_Windows1: {
                timeStamp: epochTime,
                status: false,
                error: 'na'
            },
            MYSQL_Windows2: {
                timeStamp: epochTime,
                status: false,
                error: 'na'
            },
            MYSQL_Windows98: {
                timeStamp: epochTime,
                status: false,
                error: 'na'
            },
            // FTP
            FTP_Linux1: {
                timeStamp: epochTime,
                status: false,
                error: 'na'
            },
            FTP_Linux2: {
                timeStamp: epochTime,
                status: false,
                error: 'na'
            },
            FTP_Windows1: {
                timeStamp: epochTime,
                status: false,
                error: 'na'
            },
            FTP_Windows2: {
                timeStamp: epochTime,
                status: false,
                error: 'na'
            },
            FTP_Windows98: {
                timeStamp: epochTime,
                status: false,
                error: 'na'
            },
            //ICMP
            ICMP_Linux1: {
                timeStamp: epochTime,
                status: false,
                error: 'na',
                speed: 'na'
            },
            ICMP_Linux2: {
                timeStamp: epochTime,
                status: false,
                error: 'na',
                speed: 'na'
            },
            ICMP_Windows1: {
                timeStamp: epochTime,
                status: false,
                error: 'na',
                speed: 'na'
            },
            ICMP_Windows2: {
                timeStamp: epochTime,
                status: false,
                error: 'na',
                speed: 'na'
            },
            ICMP_Windows98: {
                timeStamp: epochTime,
                status: false,
                error: 'na',
                speed: 'na'
            },

            //SSH
            SSH_Linux1: {
                timeStamp: epochTime,
                status: false,
                error: 'na'
            },
            SSH_Linux2: {
                timeStamp: epochTime,
                status: false,
                error: 'na'
            },
            SSH_Windows1: {
                timeStamp: epochTime,
                status: false,
                error: 'na'
            },
            SSH_Windows2: {
                timeStamp: epochTime,
                status: false,
                error: 'na'
            },
            SSH_Windows98: {
                timeStamp: epochTime,
                status: false,
                error: 'na'
            },

            //DNS 
            DNS_Linux1: {
                timeStamp: epochTime,
                status: false,
                error: 'na'
            },
            DNS_Linux2: {
                timeStamp: epochTime,
                status: false,
                error: 'na'
            },
            DNS_Windows1: {
                timeStamp: epochTime,
                status: false,
                error: 'na'
            },
            DNS_Windows2: {
                timeStamp: epochTime,
                status: false,
                error: 'na'
            },
            DNS_Windows98: {
                timeStamp: epochTime,
                status: false,
                error: 'na'
            },
        }
    }
}