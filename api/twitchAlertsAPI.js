var https = require("https");
var request = require("request");

var clientId = "8pIvxEwETRuQOl9DkPj5lRTKQL9Xzu6i3axLsPgf";
var clientSecret = "7v6XeEEg9UfAp6gtoI0n4vlM7ReOjo6trYWPuYg2";

var host = "http://www.twitchalerts.com/api/v1.0/";

var redirectURI = "http://localhost:3000/success";

var accessCode = null;

var accessToken = null;
var refreshToken = null;
var expiresIn = 3600; // sec
var createdAt = null;

var oldDonations = [];

function now() {
    return new Date().getTime() / 1000
}

var serverStart = now();

function setAccessCode(_accessCode) {
    accessCode = _accessCode;
}

function resetAccessCode() {
    accessCode = null;
}

function getAccessToken(callback) {
    request({
        uri: host + "token",
        method: "POST",
        form: {
            grant_type: "authorization_code",
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectURI,
            code: accessCode
        }
    }, function(error, response, body) {
        var bodyObj = JSON.parse(body);

        accessToken = bodyObj.access_token;
        refreshToken = bodyObj.refresh_token;
        createdAt = now();

        callback();
    });
}

function updateToken(callback) {
    request({
        uri: host + "token",
        method: "POST",
        form: {
            grant_type: "refresh_token",
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectURI,
            refresh_token: refreshToken
        }
    }, function(error, response, body) {
        var bodyObj = JSON.parse(body);

        accessToken = bodyObj.access_token;
        refreshToken = bodyObj.refresh_token;
        createdAt = now();

        callback();
    });
}

function checkToken(callback) {
    if(accessToken == null) {
        getAccessToken(callback);
    } else {
        if(createdAt + expiresIn < now()) { // token expired
            updateToken(callback);
        } else {
            callback();
        }
    }
}

function getDonations(callback) {
    checkToken(function() {
        request({
            uri: host + "donations",
            method: "GET",
            qs: {
                access_token: accessToken,
                limit: 25
            }
        }, function(error, response, body) {
            var bodyObj = JSON.parse(body);
            var toSend = [];
            for(var i = 0; i < bodyObj.data.length; i++) {
                var donation = bodyObj.data[i];
                if(donation.created_at > serverStart) {
                    var isNew = true;
                    for(var z = 0; z < oldDonations.length; z++) {
                        var oldDonation = oldDonations[z];
                        if (donation.donation_id == oldDonation.donation_id) {
                            isNew = false;
                        }
                    }

                    if(isNew) {
                        toSend.push(donation);
                        oldDonations.push(donation);
                    }
                }
            }
            callback(toSend);
        });
    });
}

module.exports = {
    getRedirectURI: function() {
        return redirectURI;
    },
    isSignedIn: function() {
        if(accessCode == null) {
            return false;
        } else {
            return true;
        }
    },
    setAccessCode: function(_accessCode) {
        setAccessCode(_accessCode);
    },
    resetAccessCode: function() {
        resetAccessCode();
    },
    getDonations: function(callback) {
        getDonations(callback);
    }
};