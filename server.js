process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection: ' + reason);
    console.log(promise);
});

process.on('uncaughtException', (err, origin) => {
    console.log('Uncaught Exception: ' + err);
    console.log(origin);
});

const Config = require('./config.json');

const Discord = require('discord.js');
const SteamUser = require('steam-user');
const SteamTOTP = require('steam-totp');
const GlobalOffensive = require('globaloffensive');
const SteamID = require('steamid');

const Utility_Module = require('./utility');
const Utility = new Utility_Module();

const DClient = new Discord.Client();
var DClient_Ready = false;

DClient.on('error', (err) => {
	console.log(err);
});

DClient.on('ready', () => {
	DClient_Ready = true;
});

var buisy = false;

DClient.on('message', (message) => {
	if (message.author.bot) return;
	if (message.content.indexOf(Config.Discord.botPrefix) !== 0) return;

	const channelType = message.channel.type;
	const channelName = message.channel.name;
	const channelID = message.channel.id;
	if (channelType != 'text' || !channelName || channelID != Config.Discord.botChannel) return;

	if (!Config.Discord.accessRole || message.member.roles.cache.some(role => role.name === Config.Discord.accessRole)) {
		const arguments = message.content.slice(Config.Discord.botPrefix.length).trim().split(/ +/g);
		const command = arguments.shift().toLowerCase();

		if (command === Config.Discord.botCommand) {
            message.delete().catch(console.error);

            if (!buisy) {
                buisy = true; 

                const argument = arguments.join('');
                Utility.isValidSteamID(argument).then((validSteamID) => {
                    Utility.getSteamProfile(`https://steamcommunity.com/profiles/${validSteamID}`).then((steamProfile) => {
                        message.reply(`Requesting Live Game! Please Wait.`);
                        requestLiveGameForUser(validSteamID, steamProfile, message);
                    }).catch((err) => {
                        console.log(err);
                        buisy = false;
                        message.reply(`Unable to get profile information, please try again!`);
                    });
                }).catch((err) => {
                    console.log(err);
                    buisy = false;
                    message.reply(`Invalid Argument! Use SteamID64 or Profile-URL!`);
                });
            } else {
                message.reply(`Please wait until the last user got checked!`);
            }
		}
	} else {
		message.reply(`You don't have permissions to use this command!`);
	}
});

var authorImageURL = 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/75/753bd236bb93a2484807ba75a3dbb916441825bc_full.jpg';
function sendLiveGameMessage(liveGameData, steamProfile) {
    const avatarURL = (steamProfile && steamProfile.avatarFull ? steamProfile.avatarFull[0] : null);
    const playerName = (steamProfile && steamProfile.steamID ? steamProfile.steamID : 'Unknown');

    var messageEmbed = new Discord.MessageEmbed()
    .setColor('#FFA500')
    .setAuthor(`Competitive${liveGameData.wingman ? ' Wingman' : ''}: ${Utility.getCleanMapName(liveGameData.mapName)} [ ${liveGameData.teamScore[0]} : ${liveGameData.teamScore[1]} ]`, Utility.getMapImageURL(liveGameData.mapName))
    .setDescription(`Live Game For: __**[${playerName}](https://steamcommunity.com/profiles/${liveGameData.steamID})**__`)
    .addFields(liveGameData.fields)
    .setTimestamp()
    .setFooter('Live Game Request by IceQ1337', authorImageURL);

    if (avatarURL) {
        messageEmbed.setThumbnail(avatarURL);
    }

    DClient.channels.cache.get(Config.Discord.botChannel).send(messageEmbed).catch(err => console.log(err));
}

Utility.getSteamProfile('https://steamcommunity.com/profiles/76561198129782984').then((steamProfile) => {
    if (steamProfile) authorImageURL = steamProfile.avatarFull[0];
}).catch(err => console.log(err));

DClient.login(Config.Discord.botToken);

function requestLiveGameForUser(validSteamID, steamProfile, message) {
    const steamUser = new SteamUser();

    var logOnOptions = { accountName: Config.Steam.username, password: Config.Steam.password };
    if (Config.Steam.sharedSecret) logOnOptions.twoFactorCode = SteamTOTP.getAuthCode(Config.Steam.sharedSecret);
    steamUser.logOn(logOnOptions);

    steamUser.on('error', (error) => {
        console.log(error);
    });

    steamUser.on('loggedOn', (details) => {
        steamUser.setPersona(SteamUser.EPersonaState.Invisible);
        steamUser.gamesPlayed([730]);
    });

    const csgoClient = new GlobalOffensive(steamUser);

    csgoClient.on('connectedToGC', () => {
        csgoClient.requestLiveGameForUser(validSteamID);
    });

    csgoClient.on('matchList', (matches, data) => {
        var steamID = SteamID.fromIndividualAccountID(data.accountid);

        if (steamID.getSteamID64() == validSteamID) {
            getLiveGameData(validSteamID, { matches: matches, data: data }).then((liveGameData) => {
                if (liveGameData) {
                    sendLiveGameMessage(liveGameData, steamProfile); 
                } else {
                    message.reply(`This user is currently not in an official live game!`);
                }
            }).catch((err) => {
                console.log(err);
                message.reply(`An error occurred while checking for a live game!`);
            });
        }

        steamUser.logOff();
        buisy = false;
    });
}

function getLiveGameData(validSteamID, gameData) {
    return new Promise((resolve, reject) => {
        if (gameData.matches.length <= 0) {
            resolve();
        } else {
            const matchData = gameData.matches[0];
            const gameType = matchData.watchablematchinfo.game_type;

            /*
            var lobbyType = 'Unknown';
            if (gameType) {
                switch(gameType) {
                    case 264: lobbyType = 'Unknown'; break;
                    case 520: lobbyType = '2-man premades'; break;
                    case 1032: lobbyType = 'Unknown'; break;
                    case 2056: lobbyType = 'Unknown'; break;
                    case 4104: lobbyType = 'Unknown'; break;
                    case 8200: lobbyType = 'Unknown'; break;
                    case 16392: lobbyType = 'Unknown'; break;
                    case 32776: lobbyType = '5-man premades'; break;
                    case 65544: lobbyType = 'Unknown'; break;
                    case 131080: lobbyType = 'Unknown'; break;
                    case 262152: lobbyType = 'Unknown'; break;
                    case 524296: lobbyType = 'Unknown'; break;
                    case 1048584: lobbyType = 'Unknown'; break;
                    case 268435464: lobbyType = 'Unknown'; break;
                    case 536870920: lobbyType = 'Unknown'; break;
                    case 2097160: lobbyType = 'Unknown'; break;
                    case 134217736: lobbyType = 'Unknown'; break;
                    case 8388616: lobbyType = '3-man premades (Scrimmage)'; break;
                    case 16777224: lobbyType = 'Unknown'; break;
                    case 4194312: lobbyType = 'Unknown'; break;
                    case 33554440: lobbyType = 'Unknown'; break;
                }
            }
            */
    
            var players = [];
            for (let i = 0; i < matchData.roundstats_legacy.reservation.account_ids.length; i++) {
                players.push({
                    steamid: SteamID.fromIndividualAccountID(matchData.roundstats_legacy.reservation.account_ids[i]).getSteamID64(),
                    kills: matchData.roundstats_legacy.kills[i],
                    assists: matchData.roundstats_legacy.assists[i],
                    deaths: matchData.roundstats_legacy.deaths[i],
                    scores: matchData.roundstats_legacy.scores[i],
                    mvps: matchData.roundstats_legacy.mvps[i]
                });
            }
        
            Utility.getPlayerSummaries(Config.Steam.apiKey, players.map(p => p.steamid).join(',')).then((playerSummaries) => {
                for (let i = 0; i < players.length; i++) {
                    players[i].personaname = playerSummaries[i].personaname;
                    players[i].profileurl = playerSummaries[i].profileurl;
                    players[i].avatarfull = playerSummaries[i].avatarfull;
                }
    
                var teamOne = players.splice(0, Math.floor(players.length / 2));
                var teamTwo = players;

                teamOne.sort((p1, p2) => p2.scores - p1.scores);
                teamTwo.sort((p1, p2) => p2.scores - p1.scores);

                function getPlayerStats(p) {
                    return `\`${p.kills.toString().padStart(2, ' ')}\`   \`${p.assists.toString().padStart(2, ' ')}\`   \`${p.deaths.toString().padStart(2, ' ')}\`   \`${p.mvps.toString().padStart(2, ' ')}\`   \`${p.scores.toString().padStart(2, ' ')}\``;
                }
    
                var liveGameData = {
                    steamID: validSteamID,
                    mapName: matchData.watchablematchinfo.game_map,
                    wingman: false,
                    teamScore: matchData.roundstats_legacy.team_scores,
                    fields: [
                        { name: `Game Type: ***${gameType}***.`, value: `**Players                                                        **`, inline: true },
                        { name: `\u200B`, value: `**K — A — D — M — S        ​​**`, inline: true },
                        { name: `\u200B`, value: `\u200B`, inline: true },
    
                        { name: `${Config.Customization.tTag} Terrorists [**${matchData.roundstats_legacy.team_scores[0]}**]`, value: teamOne.map(p => `[${p.personaname}](${p.profileurl})`).join('\n'), inline: true },
                        { name: `\u200B`, value: teamOne.map(p => getPlayerStats(p)).join('\n'), inline: true },
                        { name: `\u200B`, value: `\u200B`, inline: true },
    
                        { name: `${Config.Customization.ctTag} Counter-Terrorists [**${matchData.roundstats_legacy.team_scores[1]}**]`, value: teamTwo.map(p => `[${p.personaname}](${p.profileurl})`).join('\n'), inline: true },
                        { name: `\u200B`, value: teamTwo.map(p => getPlayerStats(p)).join('\n'), inline: true },
                        { name: `\u200B`, value: `\u200B`, inline: true }
                    ]
                };
    
                resolve(liveGameData);
            }).catch((err) => {
                reject(err);
            });
        }
    });
}