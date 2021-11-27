/// <reference types="node" />
import { CacheOptions } from "../utils/typings";
import internal from "stream";
declare class CacheManager {
    config?: CacheOptions;
    map: Map<string, unknown>;
    constructor(config: CacheOptions);
    private _enabled;
    private _convertStreamToBuffer;
    write(id: string, stream: internal.PassThrough): Promise<void>;
    get(id: string): unknown;
}
export default CacheManager;
