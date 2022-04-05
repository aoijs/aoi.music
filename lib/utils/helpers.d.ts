import { Track } from "../structures";
import { EndScreenVideoRenderer, YoutubeMixPlaylistData, YoutubeMixPLaylistPanelVideoRenderData, YoutubeRelatedData } from "./typings";
export declare function shuffle(array: Array<Track>): Track[];
export declare function ytMixHTMLParser(file: string): YoutubeMixPlaylistData;
export declare function ytRelatedHTMLParser(file: string): {
    endScreenVideoRenderer: EndScreenVideoRenderer;
}[];
export declare function isMix(url: string): boolean;
export declare function YoutubeMixVideo(data: YoutubeMixPLaylistPanelVideoRenderData): string;
export declare function YoutubeMix(data: YoutubeMixPlaylistData): string[];
export declare function YoutubeRelated(data: YoutubeRelatedData["playerOverlays"]["playerOverlayRenderer"]["endScreen"]["watchNextEndScreenRenderer"]["results"]): string[];
