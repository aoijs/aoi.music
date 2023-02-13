import { VoiceChannel } from "discord.js";
import { YoutubeMixPlaylistData, YoutubeMixPLaylistPanelVideoRenderData, YoutubeRelatedData } from "../typings/interfaces";
import { DiscordGatewayAdapterCreator } from "@discordjs/voice";
export declare function shuffle<T>(array: Array<T>): T[];
export declare function ytMixHTMLParser(file: string): YoutubeMixPlaylistData;
export declare function ytRelatedHTMLParser(file: string): {
    endScreenVideoRenderer: import("../typings/interfaces").EndScreenVideoRenderer;
}[];
export declare function isMix(url: string): boolean;
export declare function YoutubeMixVideo(data: YoutubeMixPLaylistPanelVideoRenderData): string;
export declare function YoutubeMix(data: YoutubeMixPlaylistData): string[];
export declare function YoutubeRelated(data: YoutubeRelatedData["playerOverlays"]["playerOverlayRenderer"]["endScreen"]["watchNextEndScreenRenderer"]["results"]): string[];
/**
 * Creates an adapter for a Voice Channel.
 *
 * @param channel - The channel to create the adapter for
 */
export declare function createAdapter(channel: VoiceChannel): DiscordGatewayAdapterCreator;
