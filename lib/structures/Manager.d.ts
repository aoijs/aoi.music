import Player from "./Player";
import { ManagerConfig, ManagerEvents } from "../utils/typings";
import { TypedEmitter } from "tiny-typed-emitter";
import { TextChannel, VoiceChannel } from "discord.js";
import { Search } from "../utils/source/Search";
declare class Manager extends TypedEmitter<ManagerEvents> {
    players: Map<string, Player>;
    config: ManagerConfig;
    searchManager: Search;
    constructor(config: ManagerConfig);
    /**
     * joinVc
     */
    joinVc({ voiceChannel, textChannel, selfDeaf, selfMute, debug, }: {
        voiceChannel: VoiceChannel;
        textChannel: TextChannel;
        selfDeaf?: boolean;
        selfMute?: boolean;
        debug?: boolean;
    }): Promise<void>;
}
export default Manager;
