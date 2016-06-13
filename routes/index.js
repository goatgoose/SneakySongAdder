var express = require('express');
var twitchAlertsAPI = require("../api/twitchAlertsAPI.js");
var youtubeAPI = require("../api/youtubeAPI.js");
var pastebinAPI = require("../api/pastebinAPI.js");
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    pastebinAPI.getPaste(function(paste) {
        res.render('index', {
            title: 'Sneaky Song Adder',
            isSignedInToTwitchAlerts: twitchAlertsAPI.isSignedIn(),
            isSignedInToYoutube: youtubeAPI.isSignedIn(),
            paste: paste
        });
    });
});

module.exports = router;
