import { Spotify } from "spotify-url-info";
import SpotifyWebApi from "spotify-web-api-node";
import { Snowflake, VoiceBasedChannel } from "discord.js";
import { TypedEmitter } from "tiny-typed-emitter/lib/index";
import IT from "youtubei.js";
import { AudioPLayerOptions, ManagerConfigurations, ManagerEvents } from "../typings/interfaces";
import { AudioPlayer } from "./audioPlayer";
import { SCDL } from "soundcloud-downloader/src";
import { PlatformType, PluginName } from "../typings/enums";
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
    spotifyApi: SpotifyWebApi;
    constructor(config?: ManagerConfigurations);
    static defaultConfig(): ManagerConfigurations;
    joinVc({ type, voiceChannel, selfDeaf, selfMute, adapter, }: {
        type: AudioPLayerOptions["type"];
        voiceChannel: VoiceBasedChannel;
        selfDeaf?: boolean;
        selfMute?: boolean;
        adapter?: any;
    }): Promise<boolean>;
    search<T extends PlatformType>(type: T, query: string, limit?: number): Promise<any>;
    addPlugin<A extends PluginName>(name: A, plugin: Plugin<A>): void;
    leaveVc(guildId: string): void;
}
