import { Client, Constants, Events, GatewayDispatchEvents, GatewayVoiceServerUpdateDispatchData, GatewayVoiceStateUpdateDispatchData, Guild, Snowflake, Status, VoiceChannel } from "discord.js";
import { rawYoutubeMixData, YoutubeMixPlaylistData, YoutubeMixPLaylistPanelVideoRenderData, YoutubeRelatedData } from "../typings/interfaces";
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
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
}

export function ytMixHTMLParser(file: string) {
    file = file.split("var ytInitialData")[1].split("=").slice(1).join("=").split("</script>")[0];
    let obj: rawYoutubeMixData;
    try {
        eval(` obj = ${file}`);
    } catch (e) {
        throw e;
    }
    return obj.contents.twoColumnWatchNextResults.playlist.playlist;
}
export function ytRelatedHTMLParser(file: string) {
    file = file.split("var ytInitialData")[1].split("=").slice(1).join("=").split("</script>")[0];
    let obj: YoutubeRelatedData;
    try {
        eval(` obj = ${file}`);
    } catch (e) {
        throw e;
    }
    return obj.playerOverlays.playerOverlayRenderer.endScreen.watchNextEndScreenRenderer.results;
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
    return data.contents.map((video) => YoutubeMixVideo(video.playlistPanelVideoRenderer));
}

export function YoutubeRelated(data: YoutubeRelatedData["playerOverlays"]["playerOverlayRenderer"]["endScreen"]["watchNextEndScreenRenderer"]["results"]) {
    return data.filter((x) => x.endScreenVideoRenderer).map((x) => x.endScreenVideoRenderer.videoId);
}

export async function isLiveStreamUrl(url: string) {
    const req = await fetch(url, {
        method: "GET"
    });

    return req.headers.get("content-type")?.includes("audio") && !req.headers.get("content-length");
}
