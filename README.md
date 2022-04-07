<p align="center">

  <a href="https://azrael.gg" target="_blank">
    <img alt="adjs-logo" height="300" alt="Azrael-DJS Logo" src="https://cdn.azrael.gg/uploads/branding/banners/azrael-djs.png"/>
  </a>
</p>

Azrael-DJS is a powerful [Node.js](https://nodejs.org/) module built off of [Discord.js v12](https://discord.js.org/#/docs/discord.js/v12/general/welcome) that allows you to easily interact with the [Discord API](https://discord.com/developers/docs/intro).

- Object-oriented
- Predictable abstractions
- Performant
- 100% coverage of the Discord API
- Native Interactions Support


# Installation

**Node.js 16.9.0 or newer is required.**
```sh-session
npm install azrael-djs
```

### Optional packages

- [zlib-sync](https://www.npmjs.com/package/zlib-sync) for WebSocket data compression and inflation (`npm install zlib-sync`)
- [erlpack](https://github.com/discord/erlpack) for significantly faster WebSocket data (de)serialisation (`npm install discord/erlpack`)
- [bufferutil](https://www.npmjs.com/package/bufferutil) for a much faster WebSocket connection (`npm install bufferutil`)
- [utf-8-validate](https://www.npmjs.com/package/utf-8-validate) in combination with `bufferutil` for much faster WebSocket processing (`npm install utf-8-validate`)
- [@discordjs/voice](https://www.npmjs.com/package/@discordjs/voice) for interacting with the Discord Voice API (`npm install @discordjs/voice`)

### Example usage

```js
const Discord = require('azrael-djs');
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('pong');
  }
});

client.login('token');
```

## Links
- [Website](https://azrael.gg)
- Documentation [Discord.js v12 Features](https://discord.js.org/#/docs/discord.js/v12/general/welcome) ::: [Discord.js v13 Features](https://discord.js.org/#/docs/discord.js/v13/general/welcome)
- Guide [Discord.js v12 Guide](https://v12.discordjs.guide/) ::: [Discord.js v13 Guide](https://discordjs.guide/additional-info/changes-in-v13.html)
- [Discord API Server](https://discord.gg/discord-api)
- [Discord Developers Server](https://discord.gg/discord-developers)
- [Azrael Github](https://github.com/Azrael-Interactive)
- [Azrael-DJS NPM](https://npmjs.org/azrael-djs)

## Create a bug report

If you see an error message or run into an issue, please [create bug report](https://github.com/Azrael-Interactive/azrael-djs/issues/new). This effort is valued and it will help all Azrael-DJS users.


# Contributing

Azrael-DJS is an open-source project. We are committed to a fully transparent development process and appreciate highly any contributions. Whether you are helping us fix bugs, proposing new features, or spreading the word - we would love to have you as part of the Azrael-DJS community.

# Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

💻[TheCuteFoxxy](https://thecutefoxxy.com)\
💻[Airbus A330-200](https://github.com)

# Source Credit
Azrael-DJS is built off of the [Discord.js](https://discord.js.org) source code and modified for public use.

