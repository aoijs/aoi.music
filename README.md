# music
Addition of the Music properties and foundation for aoi.js


# basic usage

```js
const {
  Client,
  MessageEmbed,
  TextChannel,
  NewsChannel,
  ThreadChannel,
} = require("discord.js");
const { Manager } = require("ayaya");

const client = new Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"],
});

client.login("YOUR BOT TOKEN");

const manager = new Manager({
  soundcloud: {
    clientId: "SOUNDCLOUD CLIENTID",
  },
  cache: {
    cacheType: "Memory",
    enabled: true,
  },
});
client.manager = manager;

client.on("messageCreate", async (msg) => {
const cmdName = msg.content.split(" ")[0];
  if ( cmdName === "?play") {
    const args = msg.content.trim().split(" ").slice(1);
    const type = Number(args.shift());
    const track = args.join(" ");

    manager.players
      .get(msg.guild.id)
      .search(track, type)
      .then((d) => {
        manager.players
          .get(msg.guild.id)
          .addTrack({ urls: d, type: type, member: msg.member })
          .then((title) => {
            msg.channel.send(`Added ${title}`);
          });
      });
  } else if (cmdName === "?connect") {
    manager
      .joinVc({
        voiceChannel: msg.member?.voice.channel,
        textChannel: msg.channel,
      })
      .then((x) => {
        msg.channel.send("Connected To VC");
      })
      .catch((e) => msg.channel.send(`Failed To Join VC With Reason: ${e}`));
  }
});
/**
 * @event  {} 'trackStart'
 * @param  {Track} track
 * @param  {TextChannel | NewsChannel | ThreadChannel } channel
 */
manager.on("trackStart", async (track, channel) => {
  const embed = new MessageEmbed()
    .setTitle("Now Playing")
    .setDescription(track.info?.description || "reee")
    .addField("title", track.info?.title || "reee")
    .addField(
      "duration",
      `${(track.info?.duration / 1000 / 60).toFixed(2)}mins`,
    )
    .addField("requestedBy", track.requestUser.user.tag || "reee")
    .setColor("RANDOM")
    .setImage(track.info?.thumbnail);

  channel.send({ embeds: [embed] });
});
client.on("ready", (eee) => {
  console.log("eeee");
});
```

# links
[docs](https://akaruidevelopment.github.io/music)
