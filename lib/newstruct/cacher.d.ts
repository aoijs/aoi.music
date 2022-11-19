/// <reference types="node" />
/// <reference types="node" />
import { PathLike } from "fs";
import { Readable } from "stream";
import { Track } from "../typings/types";
export declare class Cacher<T extends "memory" | "disk"> {
    #private;
    constructor({ type, }: {
        type: T;
    });
    write(metaData: Track<"SoundCloud" | "Youtube" | "LocalFile" | "Spotify" | "Url">, stream: Readable): Promise<void>;
    get(id: string): Readable;
    delete(id: string): void;
    clear(): void;
    has(id: string): boolean;
    get map(): Map<string, T extends "memory" ? PathLike : PathLike>;
    get type(): T;
    get path(): string;
}
