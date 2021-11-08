/// <reference types="node" />
import { ReadStream } from "fs";
import { Search } from "../utils/source/Search";
import Player from "./Player";
import Track from "./Track";
export default class requestManager {
    nextStream: ReadStream;
    currentStream: ReadStream;
    search: Search;
    private player;
    constructor(player: Player);
    /**
     * addStream
     */
    setCurrentStream(track: Track): Promise<void>;
    setNextStream(track: Track): Promise<void>;
}
