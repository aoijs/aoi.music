import { Snowflake, VoiceChannel } from "discord.js";
import { TypedEmitter } from "tiny-typed-emitter";
import IT from "youtubei.js/dist/src/Innertube";
import { AudioPLayerOptions, ManagerConfigurations, ManagerEvents } from "../typings/interfaces";
import { AudioPlayer } from "./audioPlayer";
import { SCDL } from "soundcloud-downloader/src";
import { Spotify } from "spotify-url-info";
import { PlatformType, PluginName } from "../typings/enums";
import Video from "youtubei.js/dist/src/parser/classes/Video";
import { TrackInfo } from "soundcloud-downloader/src/info";
import { Plugin } from "../typings/types";
export declare class Manager extends TypedEmitter<ManagerEvents> {
    #private;
    configs: ManagerConfigurations;
    players: Map<Snowflake, AudioPlayer>;
    platforms: {
        youtube: Promise<IT>;
        spotify?: Spotify;
        soundcloud: SCDL;
    };
    plugins: Map<PluginName, Plugin<PluginName>>;
    constructor(config?: ManagerConfigurations);
    static defaultConfig(): ManagerConfigurations;
    joinVc({ type, voiceChannel, selfDeaf, selfMute, }: {
        type: AudioPLayerOptions["type"];
        voiceChannel: VoiceChannel;
        selfDeaf?: boolean;
        selfMute?: boolean;
    }): Promise<void>;
    search<T extends PlatformType>(type: T, query: string, limit?: number): Promise<TrackInfo[] | Video[]>;
    addPlugin<A extends PluginName>(name: A, plugin: Plugin<A>): void;
}
