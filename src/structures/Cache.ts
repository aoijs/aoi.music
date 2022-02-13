import * as fs from "fs";
import { constructCache } from "../utils/decorators/constructs";
import { CacheOptions, PossibleStream } from "../utils/typings";
import { CacheType } from "../utils/constants";
import { Readable } from "stream";
import { Snowflake } from "discord.js";
@constructCache()
class CacheManager {
  public config?: CacheOptions = {
    limit: Infinity,
    directory: "music",
    cacheType: CacheType.Memory,
    enabled: true,
  };
  public map: Map<string, string | any[]> = new Map();
  constructor(config: CacheOptions) {
    this.config = config;
  }
  private _enabled(): boolean {
    return Boolean(this.config || this.config?.enabled);
  }

  private async _convertStreamToBuffer(stream: PossibleStream): Promise<any[]> {
    let buffer: any[] = [];
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

  async write(
    id: string,
    stream: PossibleStream,
    type: number,
    guildId: Snowflake,
  ): Promise<void> {
    console.log({ id });
    if (!this._enabled()) return;
    if (type === 1) return;
    if (this.config?.cacheType === CacheType.Memory) {
      const data = await this._convertStreamToBuffer(stream);

      this.map.set(id, data);
      return;
    } else if (this.config?.cacheType === CacheType.Disk) {
      if (!fs.existsSync(this.config.directory)) {
        fs.mkdirSync(this.config.directory);
      }
      if (!fs.existsSync(`${this.config.directory}/${guildId}`)) {
        fs.mkdirSync(`${this.config.directory}/${guildId}`);
      }
      this.map.set(
        id,
        `${this.config.directory}/${guildId}/` + id.replaceAll("/", "#SLASH#"),
      );

      fs.writeFileSync(
        `${this.config.directory}/${guildId}/` + id.replaceAll("/", "#SLASH#"),
        "",
      );
      const st = fs.createWriteStream(
        `${this.config.directory}/${guildId}/` + id.replaceAll("/", "#SLASH#"),
      );
      stream.pipe(st);
      return;
    } else {
      throw new Error(`Cache Type is invalid`);
    }
  }
  get(id: string, guildId?: Snowflake): unknown {
    if (!this._enabled()) return null;
    if (this.config?.cacheType === CacheType.Memory) {
      return Readable.from(this.map.get(id) || []);
    }
    if (this.config?.cacheType === CacheType.Disk) {
      let st: unknown;
      try {
        st = fs.createReadStream(
          `${this.config.directory}/${guildId}/${id.replaceAll(
            "/",
            "#SLASH#",
          )}`,
        );
      } catch (_) {}
      return st;
    }
    throw new Error(`Cache Type is invalid`);
  }
}

export default CacheManager;
