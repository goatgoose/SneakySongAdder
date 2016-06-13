var express = require('express');
var twitchAlertsAPI = require("../api/twitchAlertsAPI.js");
var youtubeAPI = require("../api/youtubeAPI.js");
var router = express.Router();

var timer = null;

router.post('/:action', function(req, res, next) {
    var action = req.params.action;
    var data = req.body;

    if(action == null) {
        res.send({"status": false});
    } else if(action == "ENABLE") {
        twitchAlertsAPI.updateEnableTime();
        timer = setInterval(function() {

            twitchAlertsAPI.getNewDonations(function(donations) {
                var videoIds = [];
                for(var i = 0; i < donations.length; i++) {
                    var donation = donations[i];
                    for(var z = 0; z < donation.videoIds.length; z++) {
                        videoIds.push(donation.videoIds[z]);
                    }
                }

                function songAdder(i) { // http://www.richardrodger.com/2011/04/21/node-js-how-to-write-a-for-loop-with-callbacks/#.V14IxuYrKAw
                    if(i < videoIds.length) {
                        youtubeAPI.addVideo(videoIds[i], function(video) {
                            songAdder(i + 1);
                        });
                    }
                }
                songAdder(0);
            });

        }, 30 * 1000);
        res.send({"status": true})

    } else if(action == "DISABLE") {
        clearInterval(timer);
        timer = null;
        youtubeAPI.resetPlaylist();
        res.send({"status": true});

    } else if(action == "ADD_CUSTOM_LINK") {
        youtubeAPI.addVideo(youtubeAPI.parseLink(data.link), function(video) {
            res.send({"status": true});
        });
    }
});

module.exports = router;