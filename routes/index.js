var express = require('express');
var twitchAlertsAPI = require("../api/twitchAlertsAPI.js");
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Sneaky Song Adder',
        isSignedInToTwitchAlerts: twitchAlertsAPI.isSignedIn(),
        isSignedInToYoutube: false
    });
});

module.exports = router;
