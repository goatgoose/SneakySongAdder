var express = require('express');
var router = express.Router();
var twitchAlertsAPI = require("../api/twitchAlertsAPI.js");

var clientID = twitchAlertsAPI.getClientID();
var redirectURI = twitchAlertsAPI.getRedirectURI();
var scope = "donations.read";

router.get('/', function(req, res, next) {
    res.redirect("https://www.twitchalerts.com/api/v1.0/authorize?response_type=code&client_id=" + clientID + "&redirect_uri=" + redirectURI + "&scope=" + scope);
});

module.exports = router;
