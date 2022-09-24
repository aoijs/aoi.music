/// <reference types="node" />
/// <reference types="node" />
import { CacheConfig } from "../typings/interfaces";
import { Readable } from "stream";
export declare class Cacher<T extends "memory" | "disk"> {
    #private;
    constructor(config: CacheConfig<T>);
    write(metaData: any, stream: NodeJS.ReadStream): void;
    get(id: string): Readable;
    delete(id: string): void;
    has(id: string): boolean;
}
