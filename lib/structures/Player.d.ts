import { GuildMember, TextChannel, VoiceChannel } from "discord.js";
import { VoiceConnection } from "../../node_modules/@discordjs/voice/dist";
import { LoopMode, PlayerStates } from "../utils/constants";
import { PlayerOptions, voiceState } from "../utils/typings";
import Manager from "./Manager";
import Queue from "./Queue";
import requestManager from "./requestManager";
declare class Player {
    voiceState: voiceState;
    requestManager: requestManager;
    manager: Manager;
    connection: VoiceConnection;
    voiceChannel: VoiceChannel;
    textChannel: TextChannel;
    mode: LoopMode;
    queue: Queue;
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
    addTrack({ urls, type, member }: {
        urls: string[];
        type: number;
        member: GuildMember;
    }): Promise<void>;
    play(): void;
    join(channel: VoiceChannel): void;
}
export default Player;
