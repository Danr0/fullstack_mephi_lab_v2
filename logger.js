const logFile = './logs/server.log';
const fs = require('fs');
const ipv6Prefix = "::ffff:";

function getCorrectIp(ip) { // Convert ip to ipv4 format
    if (ip.substr(0, 7) === ipv6Prefix) {
        ip = ip.substr(7)  // Check if ip is ipv6
    }
    return ip;
}

function logRequestToConsole(req, res, next) {
    let date = new Date();
    let ip = getCorrectIp(req.ip); 
    let logData = `${date} ${req.method} request at ${req.url} from ${ip}`;
    console.log(logData);

    next();
}

function logErrorsToFile(err, req, res, next) {
    let date = new Date();
    let ip = getCorrectIp(req.ip);

    let logData = `${date} ${err.name} at ${req.url} from ${ip}\n`;

    fs.appendFile(logFile, logData, function (err) {
        if (err) throw (err);
        console.log("Error was written to the log");
    })
}

exports.logErrorsToFile = logErrorsToFile;
exports.logRequestToConsole = logRequestToConsole;