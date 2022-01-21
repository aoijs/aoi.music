import { GuildMember, TextChannel, VoiceChannel } from "discord.js";
import { VoiceConnection } from "@discordjs/voice";
import { LoopMode, PlayerStates } from "../utils/constants";
import { PlayerOptions, PlayerOptionsData, voiceState } from "../utils/typings";
import { AudioPlayer } from "@discordjs/voice";
import Manager from "./Manager";
import Queue from "./Queue";
import Track from "./Track";
import { RequestManager } from "./RequestManager";
import CacheManager from "./Cache";
import FilterManager from "./FilterManager";
declare class Player {
    voiceState: voiceState;
    debug: boolean;
    requestManager: RequestManager;
    manager: Manager;
    connection: VoiceConnection;
    voiceChannel: VoiceChannel;
    textChannel: TextChannel;
    queue: Queue;
    options: PlayerOptionsData;
    private _state;
    player: AudioPlayer;
    cacheManager: CacheManager;
    filterManager: FilterManager;
    constructor(data: PlayerOptions);
    get state(): PlayerStates;
    set state(n: PlayerStates);
    /**
     * search
     */
    search(query: string, type: number): Promise<any[]>;
    /**
     * addTrack
     */
    addTrack({ urls, type, member, }: {
        urls: string[];
        type: number;
        member: GuildMember;
    }): Promise<string | number>;
    play(): void;
    join(channel: VoiceChannel): void;
    playPrevious(): Promise<void>;
    _configPlayer(): void;
    _defaultOptions(): void;
    _playNextTrack(): Promise<void>;
    _destroyPlayer(): void;
    _loopQueue(): Promise<void>;
    _playSingleTrack(): Promise<void>;
    loop(mode: LoopMode.None | LoopMode.Queue | LoopMode.Track): void;
    skip(): void;
    _autoPlay(): Promise<void>;
    pause(): void;
    resume(): void;
    getQueue(page?: number, limit?: number, customResponse?: string): {
        current: Track;
        previous: Track;
        queue: string[];
    };
}
export default Player;
