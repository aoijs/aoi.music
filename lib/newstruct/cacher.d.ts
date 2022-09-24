/// <reference types="node" />
/// <reference types="node" />
import { PathLike } from "fs";
import { CacheConfig } from "../typings/interfaces";
import { Readable } from "stream";
import { Track } from "../typings/types";
export declare class Cacher<T extends "memory" | "disk"> {
    #private;
    constructor(config: CacheConfig<T>);
    write(metaData: Track<'SoundCloud' | 'Youtube' | 'LocalFile' | 'Spotify' | 'Url'>, stream: Readable): Promise<void>;
    get(id: string): Readable;
    delete(id: string): void;
    has(id: string): boolean;
    get map(): Map<string, Readable | PathLike> | Map<string, PathLike>;
    get type(): "memory" | "disk";
    get path(): PathLike | null;
}
