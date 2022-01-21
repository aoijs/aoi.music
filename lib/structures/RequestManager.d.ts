import { AudioResource } from "@discordjs/voice";
import { Search } from "../utils/source/Search";
import Player from "./Player";
import Track from "./Track";
export declare class RequestManager {
    nextStream: AudioResource;
    currentStream: AudioResource;
    search: Search;
    private player;
    constructor(player: Player);
    /**
     * @param  {Track} track
     * @returns {Promise<void>}
     */
    setCurrentStream(track: Track): Promise<void>;
    /**
     * @param  {Track} track
     * @returns {Promise<void>}
     */
    setNextStream(track: Track): Promise<void>;
    /**
     * @returns {number}
     */
    get _currentDuration(): number;
    /**
     * e
     */
    /**
     * @param  {number} number
     * @returns void
     */
    _setVolume(number: number): void;
    /**
     * getStream
     */
    getStream(): Promise<any>;
}
