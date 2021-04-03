# LiveGameRequest_Discord
[![forthebadge](https://forthebadge.com/images/badges/built-with-love.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/uses-js.svg)](https://forthebadge.com)  

Request a cs:go players current live match via Discord bot.  

:warning: | **WARNING: THIS PROJECT IS NOT OPERATIONAL** 
:---: | :---
> Valve has removed the ability to request a user's live match. For this reason, the project does not work in its current state!  
> See this issue for updates on this topic: https://github.com/DoctorMcKay/node-globaloffensive/issues/59

Currently, the bot allows only one operation at a time and logs in and out of Steam for every single request. A much better approach would be logging into Steam once and just refreshing the game coordinator connection if needed.  

This is an old project requested by a customer that was written relatively quickly and uncleanly.  
I made this project public because I had the code just lying around. 

## Preview
![Preview Image](https://github.com/IceQ1337/LiveGameRequest_Discord/raw/master/preview.png)

## Requirements
In order to use this script, you need the following dependencies and tokens:

- Node.js: https://nodejs.org/en/ 
  - Compatible with Version 12 and 13
- Unused Steam account that will be used to check live games
- Steam API Key: https://steamcommunity.com/dev/apikey
- Discord Bot Token: https://discordapp.com/developers/applications
- Discord Channel ID: [Retrieve your Discord Channel ID](#retrieve-your-discord-channel-id)

### Dependencies
- None

## Installation
- Make sure you have the latest version of [Node.js](https://nodejs.org/) installed.
- Download this repository as [ZIP](https://github.com/IceQ1337/LiveGameRequest_Discord/archive/master.zip) and unpack it wherever you like.
- Go into the `configs` folder and rename `config.json.example` to `config.json`
- Edit `config.json` and fill in your **Steam API Key**, **Discord Bot Token** and **Discord Channel ID**
- Type `npm install` into your console of choice to install all necessary Node.js dependencies
- Type `npm start` or `node server.js` to start the script.
  - To find out how to run the script permanently on a server you should check out [forever](https://github.com/foreversd/forever).

**Make sure you have everything set up properly and your config is valid without missing information!**  

## Updating
In most cases, files only need to be overwritten, renamed or moved, but this project has **no guaranteed backward compatibility** and if the file structure changes during an update, a local installation must be manually adjusted. The only files that will remain compatible at all times are database files if not otherwise stated.

## Configuration
```Javascript
{
    "Discord": {
        "botToken": "DISCORD BOT TOKEN",
        "botChannel": "DISCORD CHANNEL ID",
        "botPrefix": "!",
        "botCommand": "check",
        "accessRole": ""
    },
    "Steam": {
        "username": "STEAM USERNAME",
        "password": "STEAM PASSWORD",
        "sharedSecret": "STEAM ACCOUNT SECRET",
        "apiKey": "STEAM API KEY"
    },
    "Customization": {
        "tTag": "🔴",
        "ctTag": "🔵"
    }
}
```

- `accessRole` is optional. If empty, everybody is allowed to use commands.

## Usage
#### Adding Profiles
- Use `!check <steamID64|profileURL>` to check live games for a specific Steam user
  - Examples:
    - `!check 12345678912345678`
	- `!check http://steamcommunity.com/profiles/12345678912345678`
    - `!check https://steamcommunity.com/id/customURL`

To get the steamID64 or URL of a profile you can use websites like [STEAMID I/O](https://steamid.io/).  

## Additional Information
### Retrieve your Discord Channel ID
In order to retrieve a unique Discord Channel ID, do as follows:
- Open your Discord Settings and click on the **Appearance** tab.
- In this tab, enable `Developer Mode`.
- Go into your Discord Server and right-click the channel to copy its id.
  - The context menu item will not be visible if Developer Mode is disabled.

### Contributing
There are currently no contributing guidelines, but I am open to any kind of improvements.  
In order to contribute to the project, please follow the **GitHub Standard Fork & Pull Request Workflow**

- **Fork** this repository on GitHub.
- **Clone** the project to your own machine.
- **Commit** changes to your own branch.
- **Push** your work to your own fork.
- Submit a **Pull Request** so I can review your changes

### Used Node.js Modules
- [Discord.js](https://github.com/discordjs/discord.js/)
- [GlobalOffensive](https://github.com/DoctorMcKay/node-globaloffensive)
- [Request](https://github.com/request/request)
- [Steam-TOTP](https://github.com/DoctorMcKay/node-steam-totp)
- [Steam-User](https://github.com/DoctorMcKay/node-steam-user)
- [SteamID](https://github.com/DoctorMcKay/node-steamid)
- [XML2JS](https://github.com/Leonidas-from-XIV/node-xml2js)

### Donating
If you find this script useful, you can support me by donating items via steam.  
[Steam Trade Link](https://steamcommunity.com/tradeoffer/new/?partner=169517256&token=77MTawmP)

### License
[MIT](https://github.com/IceQ1337/SteamBanChecker_Discord/blob/master/LICENSE)
