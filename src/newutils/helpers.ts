import { Client, Constants, Events, GatewayDispatchEvents, GatewayVoiceServerUpdateDispatchData, GatewayVoiceStateUpdateDispatchData, Guild, Snowflake, Status, VoiceChannel } from "discord.js";
import {
    rawYoutubeMixData,
    YoutubeMixPlaylistData,
    YoutubeMixPLaylistPanelVideoRenderData,
    YoutubeRelatedData,
} from "../typings/interfaces";
import { DiscordGatewayAdapterLibraryMethods, DiscordGatewayAdapterCreator } from "@discordjs/voice";

export function shuffle<T>(array: Array<T>) {
    let currentIndex = array.length,
        randomIndex: number;

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

export function ytMixHTMLParser(file: string) {
    file = file
        .split("var ytInitialData")[1]
        .split("=")
        .slice(1)
        .join("=")
        .split("</script>")[0];
    let obj: rawYoutubeMixData;
    try {
        eval(` obj = ${file}`);
    } catch (e) {
        throw e;
    }
    return obj.contents.twoColumnWatchNextResults.playlist.playlist;
}
export function ytRelatedHTMLParser(file: string) {
    file = file
        .split("var ytInitialData")[1]
        .split("=")
        .slice(1)
        .join("=")
        .split("</script>")[0];
    let obj: YoutubeRelatedData;
    try {
        eval(` obj = ${file}`);
    } catch (e) {
        throw e;
    }
    return obj.playerOverlays.playerOverlayRenderer.endScreen
        .watchNextEndScreenRenderer.results;
}

export function isMix(url: string) {
    return url.includes("watch?v=") && url.includes("&list=");
}

export function YoutubeMixVideo(data: YoutubeMixPLaylistPanelVideoRenderData) {
    const videoId = data.navigationEndpoint.watchEndpoint.videoId;
    const playlistId = data.navigationEndpoint.watchEndpoint.playlistId;
    const index = data.navigationEndpoint.watchEndpoint.index;

    return `https://www.youtube.com/watch?v=${videoId}&list=${playlistId}&index=${index}`;
}
export function YoutubeMix(data: YoutubeMixPlaylistData) {
    return data.contents.map((video) =>
        YoutubeMixVideo(video.playlistPanelVideoRenderer),
    );
}

export function YoutubeRelated(
    data: YoutubeRelatedData["playerOverlays"]["playerOverlayRenderer"]["endScreen"]["watchNextEndScreenRenderer"]["results"],
) {
    return data
        .filter((x) => x.endScreenVideoRenderer)
        .map((x) => x.endScreenVideoRenderer.videoId);
}


const adapters = new Map<Snowflake, DiscordGatewayAdapterLibraryMethods>();
const trackedClients = new Set<Client>();

/**
 * Tracks a Discord.js client, listening to VOICE_SERVER_UPDATE and VOICE_STATE_UPDATE events
 *
 * @param client - The Discord.js Client to track
 */
function trackClient(client: Client) {
    if (trackedClients.has(client)) return;
    trackedClients.add(client);
    client.ws.on(
        GatewayDispatchEvents.VoiceServerUpdate,
        (payload: GatewayVoiceServerUpdateDispatchData) => {
            adapters.get(payload.guild_id)?.onVoiceServerUpdate(payload);
        },
    );
    client.ws.on(
        GatewayDispatchEvents.VoiceStateUpdate,
        (payload: GatewayVoiceStateUpdateDispatchData) => {
            if (
                payload.guild_id &&
                payload.session_id &&
                payload.user_id === client.user?.id
            ) {
                adapters.get(payload.guild_id)?.onVoiceStateUpdate(payload);
            }
        },
    );
    client.on(Events.ShardDisconnect, (_, shardID) => {
        const guilds = trackedShards.get(shardID);
        if (guilds) {
            for (const guildID of guilds.values()) {
                adapters.get(guildID)?.destroy();
            }
        }
        trackedShards.delete(shardID);
    });
}

const trackedShards = new Map<number, Set<Snowflake>>();

function trackGuild(guild: Guild) {
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
export function createAdapter(
    channel: VoiceChannel,
): DiscordGatewayAdapterCreator {
    return (methods) => {
        adapters.set(channel.guild.id, methods);
        trackClient(channel.client);
        trackGuild(channel.guild);
        return {
            sendPayload(data) {
                if (channel.guild.shard.status === Status.Ready) {
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