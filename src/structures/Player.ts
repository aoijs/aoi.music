import { GuildMember, TextChannel, VoiceChannel } from "discord.js";
import {
  AudioPlayerStatus,
  createAudioResource,
  joinVoiceChannel,
  StreamType,
  VoiceConnection,
} from "@discordjs/voice";
import {
  CacheType,
  LoopMode,
  PlayerEvents,
  PlayerStates,
  SourceProviders,
} from "../utils/constants";
import {
  AutoPlayType,
  PlayerOptions,
  PlayerOptionsData,
  voiceState,
} from "../utils/typings";
import { AudioPlayer } from "@discordjs/voice";
import Manager from "./Manager";
import Queue from "./Queue";
import { setTimeout } from "timers/promises";
import Track from "./Track";

import CacheManager from "./Cache";
import FilterManager from "./FilterManager";
import { RequestManager } from "./RequestManager";
import { shuffle } from "../utils/helpers";

class Player {
  public voiceState: voiceState = {} as any;
  public debug: boolean;
  public requestManager: RequestManager;
  public manager: Manager;
  public connection: VoiceConnection;
  public voiceChannel: VoiceChannel;
  public textChannel: TextChannel;
  //public mode: LoopMode = LoopMode.None;
  public queue: Queue = new Queue();
  public options: PlayerOptionsData;
  private _state: PlayerStates = PlayerStates.Idling;
  public player: AudioPlayer = new AudioPlayer();
  public cacheManager: CacheManager;
  public filterManager: FilterManager;
  constructor(data: PlayerOptions) {
    this.connection = data.connection;
    this.voiceChannel = data.voiceChannel;
    this.textChannel = data.textChannel;
    this.manager = data.manager;
    this.requestManager = new RequestManager(this);
    this.filterManager = new FilterManager(this);
    this._defaultOptions();
    this.debug = data.debug;
    this._configPlayer();
    this.cacheManager = new CacheManager(
      this.manager.config.cache || {
        enabled: true,
        cacheType: CacheType.Memory,
      },
    );
  }

  get state() {
    return PlayerStates[this._state];
  }
  set state(n) {
    if (this.state === n) return;
    this._state = PlayerStates[n];
  }

  /**
   * search
   */
  public async search(query: string, type: number): Promise<any[]> {
    return await this.manager.searchManager.search({ query, type });
  }

  /**
   * addTrack
   */
  public async addTrack({
    urls,
    type,
    member,
  }: {
    urls: string[];
    type: number;
    member: GuildMember;
  }): Promise<string | number> {
    if (type === 0) {
      for (let i = 0; i < urls.length; i++) {
        const info = await this.manager.searchManager.soundCloud.getInfo(
          urls[i],
        );
        if (!info) {
          console.error(`Cannot Get Data Of ${urls[i]}`);
          continue;
        }
        const track: Track = new Track({
          requestUser: member,
          rawinfo: info,
          type,
        });
        this.queue.list.push(track);
        if (this.queue.list.length === 1 && !this.queue.current) {
          this.queue.setCurrent(track);
          console.log("added first track");
          await this.requestManager.setCurrentStream(track);
          this.play();
          console.log("started playing");
        }
        if (i !== urls.length - 1) {
          await setTimeout(5000);
        }
      }
    } else if (type === 1) {
      for (let i = 0; i < urls.length; i++) {
        const info = await this.manager.searchManager.localFile.getInfo(
          urls[i],
        );
        if (!info) {
          console.error(`Cannot Get Data Of ${urls[i]}`);
          continue;
        }
        const track: Track = new Track({
          requestUser: member,
          rawinfo: info,
          type,
        });
        this.queue.list.push(track);
        if (this.queue.list.length === 1 && !this.queue.current) {
          this.queue.setCurrent(track);
          await this.requestManager.setCurrentStream(track);
          this.play();
        }
        if (i !== urls.length - 1) {
          await setTimeout(5000);
        }
      }
    } else if (type === 2) {
      for (let i = 0; i < urls.length; i++) {
        const info = await this.manager.searchManager.attachment.getInfo(
          urls[i],
        );
        if (!info) {
          console.error(`Cannot Get Data Of ${urls[i]}`);
          continue;
        }
        const track: Track = new Track({
          requestUser: member,
          rawinfo: info,
          type,
        });
        this.queue.list.push(track);
        if (this.queue.list.length === 1 && !this.queue.current) {
          this.queue.setCurrent(track);
          await this.requestManager.setCurrentStream(track);
          this.play();
        }
        if (i !== urls.length - 1) {
          await setTimeout(5000);
        }
      }
    } else if (type === 3) {
      for (let i = 0; i < urls.length; i++) {
        const info = await this.manager.searchManager.youtube.getInfo(urls[i]);
        if (!info) {
          console.error(`Cannot Get Data Of ${urls[i]}`);
          continue;
        }
        const track: Track = new Track({
          requestUser: member,
          rawinfo: info,
          type,
        });
        this.queue.list.push(track);
        if (this.queue.list.length === 1 && !this.queue.current) {
          this.queue.setCurrent(track);
          await this.requestManager.setCurrentStream(track);
          this.play();
        }
        if (i !== urls.length - 1) {
          await setTimeout(5000);
        }
      }
    } else throw new Error(`Invalid Type: '${type}' Provided`);

    return urls.length === 1
      ? this.queue.list[this.queue.list.length - 1].info.title
      : urls.length;
  }

  play() {
    const resource = this.requestManager.currentStream;
    this.player.play(resource);
    this.manager.emit(
      PlayerEvents.TRACK_START,
      this.queue.current,
      this.textChannel,
    );
  }
  //@ts-ignore
  join(channel: VoiceChannel) {
    this.voiceState.connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guildId,
      adapterCreator: channel.guild.voiceAdapterCreator,
      group: channel.client.user.id,
    });
    this.voiceState.channel = channel;
  }

  async playPrevious(): Promise<void> {
    const track = this.queue.list.shift();
    this.queue.setCurrent(this.queue.previous);
    this.queue.previous = track;
    await this.requestManager.setCurrentStream(this.queue.current);
    this.play();
  }

  public _configPlayer(): void {
    this.player.on("stateChange", async (os, ns) => {
      console.log([os.status, ns.status]?.join("|"));
      if (
        os.status !== AudioPlayerStatus.Idle &&
        ns.status === AudioPlayerStatus.Idle
      ) {
        if (this.options.paused) {
        } else if (this.options.mode === LoopMode.Track && this.queue.current) {
          this._playSingleTrack();
        } else if (
          this.options.mode === LoopMode.Queue &&
          this.queue.list.length
        ) {
          await this._loopQueue();
        } else if (this.options.autoPlay && this.queue.list.length === 1) {
          this._autoPlay();
        } else if (this.queue.list.length > 1) {
          await this._playNextTrack();
        } else {
          this._destroyPlayer();
        }
      }
    });
    this.player.on("error", async (error: any) => {
      this.manager.emit(PlayerEvents.AUDIO_ERROR, error, this.textChannel);
    });

    if (this.debug) {
      this.player.on("debug", console.log);
    }

    this.connection.subscribe(this.player);
  }
  _defaultOptions() {
    this.options = {
      paused: false,
      mode: LoopMode.None,
      volume: 100,
      leaveAfter: { enabled: false, time: 60000 },
      leaveWhenVcEmpty: false,
      autoPlay: null,
    };
  }
  async _playNextTrack(): Promise<void> {
    const track = this.queue.list.shift();
    this.queue.previous = track;
    this.queue.setCurrent(this.queue.list[0]);
    await this.requestManager.setCurrentStream(this.queue.list[0]);
    this.play();
  }
  _destroyPlayer(): void {
    this._defaultOptions();
    this.queue = new Queue();
    this.requestManager = new RequestManager(this);
    this.cacheManager = new CacheManager(
      this.manager.config.cache || {
        enabled: true,
        cacheType: CacheType.Memory,
      },
    );
  }
  async _loopQueue() {
    const track = this.queue.list.shift();
    this.queue.previous = track;
    this.queue.list.push(track);
    this.queue.setCurrent(this.queue.list[0]);
    await this.requestManager.setCurrentStream(this.queue.list[0]);
    this.play();
  }
  async _playSingleTrack() {
    await this.requestManager.setCurrentStream(this.queue.current);
    this.play();
  }
  public loop(mode: LoopMode.None | LoopMode.Queue | LoopMode.Track): void {
    this.options.mode = mode;
  }
  public skip() {
    this.player.stop();
  }
  public async _autoPlay() {
    if (this.options.autoPlay === "soundcloud") {
      const data = await this.manager.searchManager.soundCloud.related(
        this.queue.current.rawInfo.id,
        10,
      );
      if (!data[0]) {
        this._destroyPlayer();
        console.error("failed to get next track");
        console.log(data);
      } else {
        for (const d of data) {
          this.queue.list.push(
            new Track({
              requestUser: this.textChannel.guild.me,
              rawinfo: d,
              type: 0,
            }),
          );
        }
      }
    } else if (this.options.autoPlay === "youtube") {
      const data = await this.manager.searchManager.soundCloud.related(
        this.queue.current.rawInfo.id,
        1,
      );
      this.queue.list.push(
        new Track({
          requestUser: this.textChannel.guild.me,
          rawinfo: data[0],
          type: 0,
        }),
      );
    } else if (this.options.autoPlay === "relative") {
      const data = await this.manager.searchManager.soundCloud.related(
        this.queue.current.rawInfo.id,
        1,
      );
      this.queue.list.push(
        new Track({
          requestUser: this.textChannel.guild.me,
          rawinfo: data[0],
          type: 0,
        }),
      );
    }

    await this._playNextTrack();
  }
  pause() {
    this.options.paused = true;
    this.player.pause(true);
    this.manager.emit(PlayerEvents.TRACK_PAUSE);
  }
  resume() {
    this.options.paused = false;
    this.player.unpause();
    this.manager.emit(PlayerEvents.TRACK_RESUME);
  }
  getQueue(
    page = 1,
    limit = 10,
    customResponse = `[{title}]({url}) | {user.id}`,
  ) {
    const [current, previous, list] = [
      this.queue.current,
      this.queue.previous,
      this.queue.list,
    ];
    const props = customResponse.match(/{([^}]+)}/g);
    const options = props.map((x) => x.replace("{", "").replace("}", ""));
    const queue = list.slice((page - 1) * limit, page * limit).map((x) => {
      let res = customResponse;
      props.forEach((y, a) => {
        res = res.replace(
          y,
          y.startsWith("{user.")
            ? x.requestUser.user[options[a].split(".")[1]]
            : y.startsWith("{member.")
            ? x.requestUser[options[a].split(".")[1]]
            : x.info[options[a]],
        );
      });
      return res;
    });

    return { current, previous, queue };
  }
  leaveVc() {
    this.connection.disconnect();
    this.manager.players.delete(this.voiceChannel.guildId);
  }
  removeTrack(trackPosition: number) {
    this.queue.list.splice(trackPosition, 1);
  }
  shuffleQueue() {
    this.queue.list = shuffle(this.queue.list);
  }

  skipTo(number: number) {
    if (this.options.mode != LoopMode.Queue)
      return this.queue.list.splice(0, number);
    else {
      const spliced = this.queue.list.splice(0, number);
      this.queue.list.push(...spliced);

      return spliced;
    }
  }
}

export default Player;
