/// <reference types="node" />
import fs from 'fs';
import { CacheOptions } from '../utils/typings';
import internal from 'stream';
declare class CacheManager {
    config?: CacheOptions;
    map: Map<string, internal.PassThrough>;
    constructor(config: CacheOptions);
    private _enabled;
    write(id: string, stream: internal.PassThrough): Promise<void>;
    get(id: string): fs.ReadStream | internal.PassThrough;
}
export default CacheManager;
