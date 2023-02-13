"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdapter = exports.YoutubeRelated = exports.YoutubeMix = exports.YoutubeMixVideo = exports.isMix = exports.ytRelatedHTMLParser = exports.ytMixHTMLParser = exports.shuffle = void 0;
const discord_js_1 = require("discord.js");
function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }
    return array;
}
exports.shuffle = shuffle;
function ytMixHTMLParser(file) {
    file = file
        .split("var ytInitialData")[1]
        .split("=")
        .slice(1)
        .join("=")
        .split("</script>")[0];
    let obj;
    try {
        eval(` obj = ${file}`);
    }
    catch (e) {
        throw e;
    }
    return obj.contents.twoColumnWatchNextResults.playlist.playlist;
}
exports.ytMixHTMLParser = ytMixHTMLParser;
function ytRelatedHTMLParser(file) {
    file = file
        .split("var ytInitialData")[1]
        .split("=")
        .slice(1)
        .join("=")
        .split("</script>")[0];
    let obj;
    try {
        eval(` obj = ${file}`);
    }
    catch (e) {
        throw e;
    }
    return obj.playerOverlays.playerOverlayRenderer.endScreen
        .watchNextEndScreenRenderer.results;
}
exports.ytRelatedHTMLParser = ytRelatedHTMLParser;
function isMix(url) {
    return url.includes("watch?v=") && url.includes("&list=");
}
exports.isMix = isMix;
function YoutubeMixVideo(data) {
    const videoId = data.navigationEndpoint.watchEndpoint.videoId;
    const playlistId = data.navigationEndpoint.watchEndpoint.playlistId;
    const index = data.navigationEndpoint.watchEndpoint.index;
    return `https://www.youtube.com/watch?v=${videoId}&list=${playlistId}&index=${index}`;
}
exports.YoutubeMixVideo = YoutubeMixVideo;
function YoutubeMix(data) {
    return data.contents.map((video) => YoutubeMixVideo(video.playlistPanelVideoRenderer));
}
exports.YoutubeMix = YoutubeMix;
function YoutubeRelated(data) {
    return data
        .filter((x) => x.endScreenVideoRenderer)
        .map((x) => x.endScreenVideoRenderer.videoId);
}
exports.YoutubeRelated = YoutubeRelated;
const adapters = new Map();
const trackedClients = new Set();
/**
 * Tracks a Discord.js client, listening to VOICE_SERVER_UPDATE and VOICE_STATE_UPDATE events
 *
 * @param client - The Discord.js Client to track
 */
function trackClient(client) {
    if (trackedClients.has(client))
        return;
    trackedClients.add(client);
    client.ws.on(discord_js_1.GatewayDispatchEvents.VoiceServerUpdate, (payload) => {
        adapters.get(payload.guild_id)?.onVoiceServerUpdate(payload);
    });
    client.ws.on(discord_js_1.GatewayDispatchEvents.VoiceStateUpdate, (payload) => {
        if (payload.guild_id &&
            payload.session_id &&
            payload.user_id === client.user?.id) {
            adapters.get(payload.guild_id)?.onVoiceStateUpdate(payload);
        }
    });
    client.on(discord_js_1.Events.ShardDisconnect, (_, shardID) => {
        const guilds = trackedShards.get(shardID);
        if (guilds) {
            for (const guildID of guilds.values()) {
                adapters.get(guildID)?.destroy();
            }
        }
        trackedShards.delete(shardID);
    });
}
const trackedShards = new Map();
function trackGuild(guild) {
    let guilds = trackedShards.get(guild.shardId);
    if (!guilds) {
        guilds = new Set();
        trackedShards.set(guild.shardId, guilds);
    }
    guilds.add(guild.id);
}
/**
 * Creates an adapter for a Voice Channel.
 *
 * @param channel - The channel to create the adapter for
 */
function createAdapter(channel) {
    return (methods) => {
        adapters.set(channel.guild.id, methods);
        trackClient(channel.client);
        trackGuild(channel.guild);
        return {
            sendPayload(data) {
                if (channel.guild.shard.status === discord_js_1.Status.Ready) {
                    channel.guild.shard.send(data);
                    return true;
                }
                return false;
            },
            destroy() {
                return adapters.delete(channel.guild.id);
            },
        };
    };
}
exports.createAdapter = createAdapter;
//# sourceMappingURL=helpers.js.map