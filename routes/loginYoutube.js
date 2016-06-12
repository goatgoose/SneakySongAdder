var express = require('express');
var router = express.Router();
var youtubeAPI = require("../api/youtubeAPI.js");

var clientID = youtubeAPI.getClientID();
var redirectURI = youtubeAPI.getRedirectURI();
var scope = "https://www.googleapis.com/auth/youtube";

router.get('/', function(req, res, next) {
    res.redirect("https://accounts.google.com/o/oauth2/auth?client_id=" + clientID + "&redirect_uri=" + redirectURI + "&scope=" + scope + "&response_type=code&access_type=offline");
});

module.exports = router;