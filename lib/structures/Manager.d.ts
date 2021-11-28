import Player from "./Player";
import { ManagerConfig, ManagerEvents, ManagerProviders } from "../utils/typings";
import { TypedEmitter } from "tiny-typed-emitter";
import { TextChannel, VoiceChannel } from "discord.js";
import { Search } from "../utils/source/Search";
import CacheManager from "./Cache";
declare class Manager extends TypedEmitter<ManagerEvents> {
    players: Map<string, Player>;
    config: ManagerConfig;
    providers: ManagerProviders;
    searchManager: Search;
    cacheManager: CacheManager;
    constructor(config: ManagerConfig);
    /**
     * joinVc
     */
    joinVc({ voiceChannel, textChannel, debug, }: {
        voiceChannel: VoiceChannel;
        textChannel: TextChannel;
        debug?: boolean;
    }): Promise<void>;
}
export default Manager;
