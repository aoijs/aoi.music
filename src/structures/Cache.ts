import * as fs from "fs";
import { constructCache } from "../utils/decorators/constructs";
import { CacheOptions, PossibleStream } from "../utils/typings";
import { CacheType } from "../utils/constants";
import { Readable } from "stream";
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
    let buffer:any[] = [];
    return new Promise((res) => {
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
    if (this.config?.cacheType === CacheType.Memory) {
      const data = await this._convertStreamToBuffer(stream);

      this.map.set(id, data);
      return;
    } else if (this.config?.cacheType === CacheType.Disk) {
      if (!fs.existsSync("music")) {
        fs.mkdirSync("music");
      }
      fs.writeFileSync("music/" + id.replaceAll("/", "#SLASH#"), "");
      const st = fs.createWriteStream("music/" + id.replaceAll("/", "#SLASH#"));
      stream.pipe(st);
      return;
    } else {
      throw new Error(`Cache Type is invalid`);
    }
  }
  get(id: string): unknown {
    if (!this._enabled()) return null;
    if (this.config?.cacheType === CacheType.Memory) {
      return Readable.from(this.map.get(id)||[]);
    }
    if (this.config?.cacheType === CacheType.Disk) {
      let st: unknown;
      try {
        st = fs.createReadStream(id);
      } catch (_) {}
      return st;
    }
    throw new Error(`Cache Type is invalid`);
  }
}

export default CacheManager;
