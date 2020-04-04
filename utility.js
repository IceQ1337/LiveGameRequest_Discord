const SteamID = require('steamid');
const Request = require('request');
const XML = require('xml2js');

module.exports = function() {
    this.getSteamProfile = (profileURL) => {
        return new Promise((resolve, reject) => {
            Request(profileURL + '/?xml=1', (err, response, body) => {
                if (err) reject(err);
            
                if (response.statusCode && response.statusCode === 200) {
                    XML.parseString(body, (err, result) => {
                        if (err) reject(err);
                        if (result.profile) resolve(result.profile);
                        resolve();
                    });
                } else {
                    reject();
                }
            });
        });
    };

    this.resolveCustomURL = (customURL) => {
        return new Promise((resolve, reject) => {
            Request('https://steamcommunity.com/id/' + customURL + '?xml=1', (err, response, body) => {
                if (err) reject(err);
    
                if (response.statusCode && response.statusCode === 200) {
                    XML.parseString(body, (err, result) => {
                        if (err) reject(err);
                        resolve(result.profile.steamID64[0]);
                    });
                } else {
                    reject();
                }
            });
        });
    };

    this.isValidSteamID = (argument) => {
        return new Promise((resolve, reject) => {
            const profileURL = /^(((http|https):\/\/(www\.)?)?steamcommunity.com\/profiles\/([0-9]{17}))|([0-9]{17})$/;
            const customURL = /^((http|https):\/\/(www\.)?)?steamcommunity.com\/id\//;

            if (argument.match(profileURL)) {
                var steamID = argument.match(/[0-9]{17}/gi)[0];
                var realID = new SteamID(steamID);
                if (realID && realID.isValid()) {
                    resolve(steamID);
                } else {
                    resolve();
                }
            } else if (argument.match(customURL)) {
                var url = argument.replace(customURL, '');
                if (url.charAt(url.length - 1) == '/') {
                    url = url.substring(0, url.length - 1);
                }

                this.resolveCustomURL(url).then((steamID) => {
                    var realID = new SteamID(steamID);
                    if (realID && realID.isValid()) {
                        resolve(steamID);
                    } else {
                        resolve();
                    }
                }).catch((err) => {
                    reject(err);
                });
            } else {
                reject();
            }
        });
    };

    this.getPlayerSummaries = (apiKey, steamIDs) => {
        return new Promise((resolve, reject) => {
            Request(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamIDs}`, (err, response, body) => {
                if (err) console.log(err);
                if (response && response.statusCode && response.statusCode === 200) {
                    const apiData = JSON.parse(body).response;
                    if (apiData.players && apiData.players.length > 0) {
                        var playerSummaries = [];
                        for (let i = 0; i < apiData.players.length; i++) {
                            playerSummaries.push({
                                steamid: apiData.players[i].steamid,
                                personaname: apiData.players[i].personaname,
                                profileurl: apiData.players[i].profileurl,
                                avatarfull: apiData.players[i].avatarfull
                            });
                        }
                        resolve(playerSummaries);
                    } else {
                        reject();
                    }
                } else {
                    reject();
                }
            });
        });
    };

    this.getCleanMapName = (mapName) => {
        var clearName = mapName.substring(3);
        return clearName.charAt(0).toUpperCase() + clearName.slice(1);
    };

    this.getMapImageURL = (mapName) => {
        var mapList = [
            'ar_baggage',
            'cs_assault',
            'cs_italy',
            'cs_militia',
            'cs_office',
            'de_aztec',
            'de_bank',
            'de_cache',
            'de_canals',
            'de_cbble',
            'de_dust',
            'de_dust2',
            'de_inferno',
            'de_lake',
            'de_mirage',
            'de_nuke',
            'de_overpass',
            'de_safehouse',
            'de_train',
            'de_vertigo'
        ];
        return mapIconURL = `https://raw.githubusercontent.com/SteamDatabase/GameTracking-CSGO/0e457516ba13817a45b6c2a1d262fe7d0599bcbc/csgo/pak01_dir/resource/flash/images/map_icons/collection_icon_${(mapList.includes(mapName) ? mapName : 'none')}.png`;
    };
}