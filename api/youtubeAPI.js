var https = require("https");
var request = require("request");

var clientID = "225787570178-hjb5o7vt1685an576cbtdo044k61kr65.apps.googleusercontent.com";
var clientSecret = "whCIlvsEhtY7RIsOoe5Soyk_";

var host = "https://accounts.google.com/o/oauth2/";

var redirectURI = "http://localhost:3000/successYoutube";

var accessCode = null;

var accessToken = null;
var refreshToken = null;
var expiresIn = 3600; // sec
var createdAt = null;

var playlist = null; // delete on disable

function now() {
    return new Date().getTime() / 1000
}

function parseLink(link) {
    // https://www.youtube.com/watch?v=O4zxgJXbZX8&t=1427s
    if(link.indexOf("&") != -1) {
        return link.substring(link.indexOf("youtube.com/watch?v=") + 20, link.indexOf("&"));
    } else {
        return link.substring(link.indexOf("youtube.com/watch?v=") + 20);
    }

}

function getAccessToken(callback) {
    request({
        uri: host + "token",
        method: "POST",
        form: {
            grant_type: "authorization_code",
            client_id: clientID,
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
            client_id: clientID,
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

function getPlaylist(playlistTitle, callback) {
    checkToken(function() {
        request({
            uri: "https://www.googleapis.com/youtube/v3/playlists",
            method: "GET",
            qs: {
                access_token: accessToken,
                part: "snippet",
                mine: true,
                maxResults: 50
            }
        }, function(error, response, body) {
            var bodyObj = JSON.parse(body);
            var exists = null;
            for(var i = 0; i < bodyObj.items.length; i++) {
                playlist = bodyObj.items[i];
                if(playlistTitle == playlist.snippet.title) {
                    exists = playlist;
                }
            }
            callback(exists);
        });
    });
}

function createPlaylist(playlistTitle, callback) {
    request({
        uri: "https://www.googleapis.com/youtube/v3/playlists",
        method: "POST",
        headers: {
            "Authorization": "Bearer " + accessToken
        },
        qs: {
            "part": "snippet,status"
        },
        body: {
            "snippet": {
                "title": playlistTitle
            },
            "status": {
                "privacyStatus": "public"
            }
        },
        json: true
    }, function(error, response, body) {
        callback(body);
    });
}

function handleCurrentPlaylist(callback) {
    var today = new Date();
    var day = today.getDate();
    var month = today.getMonth() + 1; // january is 0 xd
    var year = today.getFullYear();

    year = year.toString().substring(2);

    today = month+'/'+day+'/'+year; // sneaky naming convention tm

    if(playlist != null) {
        callback();
    } else {
        checkToken(function() {
            getPlaylist(today, function(_playlist) {
                if(_playlist != null) {
                    playlist = _playlist;
                    callback();
                } else {
                    createPlaylist(today, function(_playlist) {
                        playlist = _playlist;
                        callback();
                    });
                }
            });
        });
    }
}

function getVideo(id, callback) {
    request({
        uri: "https://www.googleapis.com/youtube/v3/videos",
        method: "GET",
        headers: {
            "Authorization": "Bearer " + accessToken
        },
        qs: {
            part: "id",
            id: id,
            json: true
        }
    }, function(error, response, body) {
        var bodyObj = JSON.parse(body);
        if(bodyObj.items.length > 0) {
            callback(bodyObj.items[0]);
        } else {
            callback(null);
        }
    });
}

function addVideo(id, callback) {
    handleCurrentPlaylist(function() {
        getVideo(id, function(video) {
            if(video != null) {
                request({
                    uri: "https://www.googleapis.com/youtube/v3/playlistItems",
                    method: "POST",
                    headers: {
                        "Authorization": "Bearer " + accessToken
                    },
                    qs: {
                        "part": "snippet"
                    },
                    body: {
                        "snippet": {
                            "playlistId": playlist.id,
                            "resourceId": {
                                "kind": "youtube#video",
                                "videoId": video.id
                            }
                        }
                    },
                    json: true
                }, function(error, response, body) {
                    console.log(body.snippet.title);
                    callback(body);
                });
            } else {
                callback(null);
            }
        });
    });
}

module.exports = {
    getClientID: function() {
        return clientID;
    },
    getRedirectURI: function() {
        return redirectURI;
    },
    setAccessCode: function(_accessCode) {
        accessCode = _accessCode;
    },
    isSignedIn: function() {
        if(accessCode == null) {
            return false;
        } else {
            return true;
        }
    },
    addVideo: function(videoId, callback) {
        addVideo(videoId, callback);
    },
    resetPlaylist: function() {
        playlist = null;
    },
    parseLink: function(link) {
        return parseLink(link);
    }
};