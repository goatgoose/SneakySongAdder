var https = require("https");
var request = require("request");

function getPaste(callback) {
    request({
        uri: "http://pastebin.com/raw/B8Kq4e4F",
        method: "GET"
    }, function(error, response, body) {
        callback(body);
    });
}

module.exports = {
    getPaste: function(callback) {
        getPaste(callback);
    }
};