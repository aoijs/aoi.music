"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const voice_1 = require("@discordjs/voice");
const constants_1 = require("../utils/constants");
const voice_2 = require("@discordjs/voice");
const Queue_1 = __importDefault(require("./Queue"));
const promises_1 = require("timers/promises");
const Track_1 = __importDefault(require("./Track"));
const requestManager_1 = __importDefault(require("./requestManager"));
class Player {
    constructor(data) {
        this.voiceState = {};
        //public mode: LoopMode = LoopMode.None;
        this.queue = new Queue_1.default();
        this._state = constants_1.PlayerStates.Idling;
        this.player = new voice_2.AudioPlayer();
        this.connection = data.connection;
        this.voiceChannel = data.voiceChannel;
        this.textChannel = data.textChannel;
        this.manager = data.manager;
        this.requestManager = new requestManager_1.default(this);
        this._defaultOptions();
        this.debug = data.debug;
        this._configPlayer();
    }
    get state() {
        return constants_1.PlayerStates[this._state];
    }
    set state(n) {
        if (this.state === n)
            return;
        this._state = constants_1.PlayerStates[n];
    }
    /**
     * search
     */
    async search(query, type) {
        return await this.manager.searchManager.search({ query, type });
    }
    /**
     * addTrack
     */
    async addTrack({ urls, type, member, }) {
        if (type === 0) {
            for (const url of urls) {
                const info = await this.manager.searchManager.soundCloud.getInfo(url);
                if (!info) {
                    console.error(`Cannot Get Data Of ${url}`);
                    continue;
                }
                const track = new Track_1.default({
                    requestUser: member,
                    rawinfo: info,
                    type,
                });
                this.queue.list.push(track);
                if (this.queue.list.length === 1) {
                    this.queue.setCurrent(track);
                    console.log("added first track");
                    await this.requestManager.setCurrentStream(track);
                    this.play();
                    console.log("started playing");
                }
                await (0, promises_1.setTimeout)(5000);
            }
        }
        else if (type === 1) {
            for (const url of urls) {
                const info = await this.manager.searchManager.localFile.getInfo(url);
                if (!info) {
                    console.error(`Cannot Get Data Of ${url}`);
                    continue;
                }
                const track = new Track_1.default({
                    requestUser: member,
                    rawinfo: info,
                    type,
                });
                this.queue.list.push(track);
                if (this.queue.list.length === 1) {
                    this.queue.setCurrent(track);
                    await this.requestManager.setCurrentStream(track);
                    this.play();
                }
                await (0, promises_1.setTimeout)(5000);
            }
        }
        else if (type === 2) {
            for (const url of urls) {
                const info = await this.manager.searchManager.attachment.getInfo(url);
                if (!info) {
                    console.error(`Cannot Get Data Of ${url}`);
                    continue;
                }
                const track = new Track_1.default({
                    requestUser: member,
                    rawinfo: info,
                    type,
                });
                this.queue.list.push(track);
                if (this.queue.list.length === 1) {
                    this.queue.setCurrent(track);
                    await this.requestManager.setCurrentStream(track);
                    this.play();
                }
                await (0, promises_1.setTimeout)(5000);
            }
        }
        else
            throw new Error(`Invalid Type: '${type}' Provided`);
    }
    play() {
        const resource = this.requestManager.currentStream;
        this.player.play(resource);
    }
    join(channel) {
        this.voiceState.connection = (0, voice_1.joinVoiceChannel)({
            channelId: channel.id,
            guildId: channel.guildId,
            adapterCreator: channel.guild.voiceAdapterCreator,
            group: channel.client.user.id,
        });
        this.voiceState.channel = channel;
    }
    async playPrevious() {
        const track = this.queue.list.shift();
        this.queue.setCurrent(this.queue.previous);
        this.queue.previous = track;
        await this.requestManager.setCurrentStream(this.queue.current);
        this.play();
    }
    _configPlayer() {
        this.player.on("stateChange", async (os, ns) => {
            console.log([os.status, ns.status]?.join("|"));
            if (os.status !== voice_1.AudioPlayerStatus.Idle &&
                ns.status === voice_1.AudioPlayerStatus.Idle) {
                if (this.options.paused)
                    return;
                else if (this.options.mode === constants_1.LoopMode.Track && this.queue.current) {
                    //this._playSingleTrack()
                }
                else if (this.options.mode === constants_1.LoopMode.Queue &&
                    this.queue.list.length) {
                    //this._loopQueue()
                }
                else if (this.queue.list.length > 1) {
                    this._playNextTrack();
                }
                else {
                    this._destroyPlayer();
                }
            }
        });
        this.player.on("error", async (message) => console.error(message));
        if (this.debug) {
            this.player.on("debug", console.log);
        }
        this.connection.subscribe(this.player);
    }
    _defaultOptions() {
        this.options = {
            paused: false,
            mode: constants_1.LoopMode.None,
            volume: 100,
            leaveAfter: { enabled: false, time: 60000 },
            leaveWhenVcEmpty: false,
        };
    }
    async _playNextTrack() {
        const track = this.queue.list.shift();
        this.queue.previous = track;
        this.queue.setCurrent(this.queue.list[0]);
        await this.requestManager.setCurrentStream(this.queue.list[0]);
        this.play();
    }
    _destroyPlayer() {
        this._defaultOptions();
        this.queue = new Queue_1.default();
        this.requestManager = new requestManager_1.default(this);
    }
}
exports.default = Player;
//# sourceMappingURL=Player.js.map