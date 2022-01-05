import * as fs from "fs";
import { constructCache } from "../utils/decorators/constructs";
import { CacheOptions, PossibleStream } from "../utils/typings";
import { CacheType } from "../utils/constants";

@constructCache()
class CacheManager {
  public config?: CacheOptions;
  public map: Map<string, any[]> = new Map();
  constructor(config: CacheOptions) {
    this.config = config;
  }
  private _enabled(): boolean {
    return Boolean(this.config || this.config?.enabled);
  }

  private async _convertStreamToBuffer(stream: PossibleStream): Promise<any[]> {
    let buffer = [];
    return new Promise((res, rej) => {
      stream.on("data", (chunk) => buffer.push(chunk));
      stream.on("end", (_) => {
        buffer.concat(buffer);
        res(buffer);
      });
      stream.on("error", (err) =>
        console.error(`failed to convert with reason: ${err}`),
      );
    });
  }

  async write(id: string, stream: PossibleStream): Promise<void> {
    if (!this._enabled()) return;
    if (this.config.cacheType === CacheType.Memory) {
      const data = await this._convertStreamToBuffer(stream);

      this.map.set(id, data);
      return;
    }
    if (this.config.cacheType === CacheType.Disk) {
      const st = fs.createWriteStream(id);
      stream.pipe(st);
      return;
    }
    throw new Error(`Cache Type is invalid`);
  }

  get(id: string): unknown {
    if (!this._enabled()) return null;
    if (this.config.cacheType === CacheType.Memory) {
      return this.map.get(id);
    }
    if (this.config.cacheType === CacheType.Disk) {
      const st = fs.createReadStream(id);
      return st;
    }
    throw new Error(`Cache Type is invalid`);
  }
}

export default CacheManager;
