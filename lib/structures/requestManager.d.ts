import { AudioResource } from "@discordjs/voice";
import { Search } from "../utils/source/Search";
import Player from "./Player";
import Track from "./Track";
export default class requestManager {
    nextStream: AudioResource;
    currentStream: AudioResource;
    search: Search;
    private player;
    constructor(player: Player);
    /**
     * addStream
     */
    setCurrentStream(track: Track): Promise<void>;
    setNextStream(track: Track): Promise<void>;
    /**
     * currentDuration
     */
    get _currentDuration(): number;
    /**
     * e
     */
    get _volume(): import("prism-media").VolumeTransformer;
}
