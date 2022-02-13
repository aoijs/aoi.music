import { CacheOptions, PossibleStream } from "../utils/typings";
import { Snowflake } from "discord.js";
declare class CacheManager {
    config?: CacheOptions;
    map: Map<string, string | any[]>;
    constructor(config: CacheOptions);
    private _enabled;
    private _convertStreamToBuffer;
    write(id: string, stream: PossibleStream, type: number, guildId: Snowflake): Promise<void>;
    get(id: string, guildId?: Snowflake): unknown;
}
export default CacheManager;
