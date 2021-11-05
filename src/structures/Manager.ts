import Player from "./Player";
import { ManagerConfig, ManagerEvents } from "../utils/typings";
import { TypedEmitter } from 'tiny-typed-emitter';
import scdl from 'soundcloud-downloader';
import { constructManager } from "../utils/decorators/constructs";

@constructManager()
class Manager extends TypedEmitter<ManagerEvents> {
    public players: Map<string, Player> = new Map();
    public config: ManagerConfig;
    constructor(config: ManagerConfig) {
        super();
        this.config = config;
    }

    search() {
        
    }
}

export default Manager;