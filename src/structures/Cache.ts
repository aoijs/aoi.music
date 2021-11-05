import fs from 'fs';
import { constructCache } from '../utils/decorators/constructs';
import { CacheOptions } from '../utils/typings';
import internal from 'stream'
import { CacheType } from '../utils/constants';

@constructCache()
class CacheManager {
    public config?: CacheOptions;
    public map: Map<string, internal.PassThrough> = new Map();
    constructor(config: CacheOptions) {
        this.config = config;
    }
    private _enabled() {
        return Boolean(this.config || this.config?.enabled)
    }

    async write(id: string, stream: internal.PassThrough) {
        if (!this._enabled()) return;
        if (this.config.cacheType === CacheType.Memory) {
            this.map.set(id, stream);
            return;
        };
        if (this.config.cacheType === CacheType.Disk) {
            const st = fs.createWriteStream(id);
            stream.pipe(st);
            return;
        }
        throw new Error(`Cache Type is invalid`);
    }

    get(id: string) {
        if (!this._enabled()) return null;
        if (this.config.cacheType === CacheType.Memory) {
            return this.map.get(id);
        };
        if (this.config.cacheType === CacheType.Disk) {
            const st = fs.createReadStream(id);
            return st;
        }
        throw new Error(`Cache Type is invalid`);
    }
}

export default CacheManager;