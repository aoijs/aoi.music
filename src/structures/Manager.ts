import Player from "./Player";
import { ManagerConfig, ManagerEvents, ManagerProviders } from "../utils/typings";
import { TypedEmitter } from 'tiny-typed-emitter';
import { constructManager } from "../utils/decorators/constructs";
import { SoundcloudProvider, TwitchProvider } from "../utils/source";

@constructManager()
class Manager extends TypedEmitter<ManagerEvents> {
    public players: Map<string, Player> = new Map();
    public config: ManagerConfig;
    public providers: ManagerProviders = {twitch: new TwitchProvider(), soundcloud: new SoundcloudProvider()}
    constructor(config: ManagerConfig) {
        super();
        this.config = config;
    }
}

export default Manager;