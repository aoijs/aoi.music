import { Snowflake, VoiceChannel } from "discord.js";
import { TypedEmitter } from "tiny-typed-emitter";
import IT from "youtubei.js/dist/src/Innertube";
import { AudioPLayerOptions, ManagerConfigurations, ManagerEvents } from "../typings/interfaces";
import { AudioPlayer } from "./audioPlayer";
import { SCDL } from "soundcloud-downloader/src";
import { Spotify } from "spotify-url-info";
export declare class Manager extends TypedEmitter<ManagerEvents> {
    #private;
    configs: ManagerConfigurations;
    players: Map<Snowflake, AudioPlayer>;
    platforms: {
        youtube: Promise<IT>;
        spotify?: Spotify;
        soundcloud: SCDL;
    };
    constructor(config?: ManagerConfigurations);
    static defaultConfig(): ManagerConfigurations;
    joinVc({ type, voiceChannel, selfDeaf, selfMute, }: {
        type: AudioPLayerOptions['type'];
        voiceChannel: VoiceChannel;
        selfDeaf?: boolean;
        selfMute?: boolean;
    }): Promise<void>;
}
