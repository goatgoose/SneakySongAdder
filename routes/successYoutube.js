var express = require('express');
var urlParser = require("url");
var youtubeAPI = require("../api/youtubeAPI.js");

var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('successYoutube', { title: 'Success' });
});

router.post('/', function(req, res, next) {
    var url = urlParser.parse(req.body.urlInput);
    var accessCode = url.query.substring(5, url.query.length);
    youtubeAPI.setAccessCode(accessCode);
    youtubeAPI.addSong();
    res.redirect('/');
});

module.exports = router;