import { GuildMember, TextChannel, VoiceChannel } from "discord.js";
import { VoiceConnection } from "@discordjs/voice";
import { PlayerStates } from "../utils/constants";
import { PlayerOptions, PlayerOptionsData, voiceState } from "../utils/typings";
import Manager from "./Manager";
import Queue from "./Queue";
import requestManager from "./requestManager";
declare class Player {
    voiceState: voiceState;
    debug: boolean;
    requestManager: requestManager;
    manager: Manager;
    connection: VoiceConnection;
    voiceChannel: VoiceChannel;
    textChannel: TextChannel;
    queue: Queue;
    options: PlayerOptionsData;
    private _state;
    private player;
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
    }): Promise<void>;
    play(): void;
    join(channel: VoiceChannel): void;
    playPrevious(): Promise<void>;
    _configPlayer(): void;
    _defaultOptions(): void;
    _playNextTrack(): Promise<void>;
    _destroyPlayer(): void;
}
export default Player;
