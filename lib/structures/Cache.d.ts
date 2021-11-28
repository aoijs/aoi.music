import { CacheOptions, PossibleStream } from "../utils/typings";
declare class CacheManager {
    config?: CacheOptions;
    map: Map<string, unknown>;
    constructor(config: CacheOptions);
    private _enabled;
    private _convertStreamToBuffer;
    write(id: string, stream: PossibleStream): Promise<void>;
    get(id: string): unknown;
}
export default CacheManager;
