import { Readable } from "stream";
import { Track } from "../typings/types";
export declare class Cacher<T extends "memory" | "disk"> {
    #private;
    constructor({ type }: {
        type: T;
    });
    write(metaData: Track<"SoundCloud" | "Youtube" | "LocalFile" | "Spotify" | "Url">, stream: Readable): Promise<void>;
    get(id: string): any;
    delete(id: string): void;
    clear(): void;
    has(id: string): boolean;
    get map(): Map<string, T extends "memory" ? any : PathLike>;
    get type(): T;
    get path(): string;
}
