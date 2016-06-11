var express = require('express');
var urlParser = require("url");
var twitchAlertsAPI = require("../api/twitchAlertsAPI.js");

var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('success', { title: 'Success' });
});

router.post('/', function(req, res, next) {
    var url = urlParser.parse(req.body.urlInput);
    var accessCode = url.query.substring(5, url.query.length);
    twitchAlertsAPI.setAccessCode(accessCode);
    res.redirect('/');
});

module.exports = router;