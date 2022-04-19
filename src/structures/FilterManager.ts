import { createAudioResource, StreamType } from "@discordjs/voice";
import * as prism from "prism-media";
import Player from "./Player";
export default class FilterManager {
  filters: string[];
  player: Player;
  args: string[];
  constructor(player: Player) {
    this.filters = [];
    this.player = player;
    this.args = [
      "-analyzeduration",
      "0",
      "-loglevel",
      "0",
      "-preset",
      "veryfast",
      "-f",
      "s16le",
      "-ar",
      "48000",
      "-ac",
      "2",
      "-vn",
    ];
  }
  /**
   * @method addFilters
   * @param  {any[]} ...filters
   * @returns void
   */
  public async addFilters(filters: object) {
    for (const [filter, data] of Object.entries(filters)) {
      this.filters.push(`${filter}=${data}`);
    }
    return await this._applyFilters();
  }
  /**
   * @method removeFilters
   * @param  {any[]} ...filters
   * @returns void
   */
  public removeFilters(...filters: any[]): void {
    for (const filter of filters) {
      delete this.filters[filter];
    }
  }

  public async setFilters(filters: object) {
    this.filters = [];
    for (const [filter, data] of Object.entries(filters)) {
      this.filters.push(`${filter}=${data}`);
    }
    return await this._applyFilters();
  }

  public async resetFilters() {
    this.filters = [];
    return await this._applyFilters();
  }
  public async setComplexFilters(filters: string) {}
  public async _applyFilters() {
    const args = [...this.args];
    if (this.player.options.seekWhenFilter) {
      const duration =
        this.player.requestManager.currentStream.playbackDuration;
      args.unshift("-ss", Math.trunc(duration / 1000).toString());
    }
    const filters = this.filters.join(",");
    if (filters.length > 0) {
      args.push("-af");
      args.push(filters);
    }
    const ffmpeg = new prism.FFmpeg({
      args,
    });

    const opus = new prism.opus.Encoder({
      rate: 48000,
      channels: 2,
      frameSize: 960,
    });
    const stream = await this.player.requestManager.getStream();
    const fdata = stream.pipe(ffmpeg);

    const resource = createAudioResource(fdata.pipe(opus), {
      inlineVolume: true,
      inputType: StreamType.Opus,
    });
    this.player.requestManager.currentStream = resource;

    this.player.play();
    return this.filters;
  }

  async seekTo(time: number) {
    const args = [...this.args];

    args.unshift("-ss", `${time}`);
    if (this.filters.length > 0) {

      args.push("-af");
      args.push(this.filters.join(","));
    }

    const ffmpeg = new prism.FFmpeg({
      args,
    });
    const fdata = (await this.player.requestManager.getStream()).pipe(ffmpeg);

    const resource = createAudioResource(fdata, {
      inlineVolume: true,
      inputType: StreamType.Raw,
    });

    this.player.requestManager.currentStream = resource;
    resource.playbackDuration = time * 1000;
    this.player.play();
  }
}
