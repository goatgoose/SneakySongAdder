var express = require('express');
var twitchAlertsAPI = require("../api/twitchAlertsAPI.js");
var router = express.Router();

var timer = null;

router.post('/:action', function(req, res, next) {
    var action = req.params.action;

    if(action == null) {
        res.send({"status": false});
    } else if(action == "ENABLE") {
        timer = setInterval(function() {
            twitchAlertsAPI.getDonations(function(donations) {

            });

        }, 30 * 1000);
        res.send({"status": true})

    } else if(action == "DISABLE") {
        clearInterval(timer);
        timer = null;
        res.send({"status": true});
    }
});

module.exports = router;