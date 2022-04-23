"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("fs/promises");
const timers_1 = require("timers");
const voice_1 = require("@discordjs/voice");
const constants_1 = require("../utils/constants");
const voice_2 = require("@discordjs/voice");
const Queue_1 = __importDefault(require("./Queue"));
const promises_2 = require("timers/promises");
const Track_1 = __importDefault(require("./Track"));
const Cache_1 = __importDefault(require("./Cache"));
const FilterManager_1 = __importDefault(require("./FilterManager"));
const RequestManager_1 = require("./RequestManager");
const helpers_1 = require("../utils/helpers");
const fs_1 = require("fs");
class Player {
    constructor(data) {
        this.voiceState = {};
        //public mode: LoopMode = LoopMode.None;
        this.queue = new Queue_1.default();
        this._state = constants_1.PlayerStates.Idling;
        this.player = new voice_2.AudioPlayer();
        this.reseted = false;
        this.connection = data.connection;
        this.voiceChannel = data.voiceChannel;
        this.textChannel = data.textChannel;
        this.manager = data.manager;
        this.requestManager = new RequestManager_1.RequestManager(this);
        this.filterManager = new FilterManager_1.default(this);
        this._defaultOptions();
        this.debug = data.debug;
        this._configPlayer();
        this._configConnection();
        this.cacheManager = new Cache_1.default(this.manager.config.cache);
        this.extraData = {
            youtube: {
                mixLastUrl: "",
                mixIndex: 0,
            },
        };
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
            for (let i = 0; i < urls.length; i++) {
                if (this.reseted) {
                    this.reseted = false;
                    break;
                }
                const info = await this.manager.searchManager.soundcloud.getInfo(urls[i]);
                if (!info) {
                    console.error(`Cannot Get Data Of ${urls[i]}`);
                    continue;
                }
                const track = new Track_1.default({
                    requestUser: member,
                    rawinfo: info,
                    type,
                }, this);
                this.queue.list.push(track);
                if (this.queue.list.length === 1 && !this.queue.current) {
                    this.queue.setCurrent(track);
                    this.manager.emit(constants_1.PlayerEvents.QUEUE_START, urls, this.textChannel);
                    await this.requestManager.setCurrentStream(track);
                    this.play();
                }
                if (i !== urls.length - 1) {
                    await (0, promises_2.setTimeout)(this.manager.config.playerOptions?.trackInfoInterval ?? 5000);
                }
            }
        }
        else if (type === 1) {
            for (let i = 0; i < urls.length; i++) {
                if (this.reseted) {
                    this.reseted = false;
                    break;
                }
                const info = await this.manager.searchManager.localFile.getInfo(urls[i]);
                if (!info) {
                    console.error(`Cannot Get Data Of ${urls[i]}`);
                    continue;
                }
                const track = new Track_1.default({
                    requestUser: member,
                    rawinfo: info,
                    type,
                }, this);
                this.queue.list.push(track);
                if (this.queue.list.length === 1 && !this.queue.current) {
                    this.queue.setCurrent(track);
                    this.manager.emit(constants_1.PlayerEvents.QUEUE_START, urls, this.textChannel);
                    await this.requestManager.setCurrentStream(track);
                    this.play();
                }
                if (i !== urls.length - 1) {
                    await (0, promises_2.setTimeout)(this.manager.config.playerOptions?.trackInfoInterval ?? 5000);
                }
            }
        }
        else if (type === 2) {
            for (let i = 0; i < urls.length; i++) {
                if (this.reseted) {
                    this.reseted = false;
                    break;
                }
                const info = await this.manager.searchManager.attachment.getInfo(urls[i]);
                if (!info) {
                    console.error(`Cannot Get Data Of ${urls[i]}`);
                    continue;
                }
                const track = new Track_1.default({
                    requestUser: member,
                    rawinfo: info,
                    type,
                }, this);
                this.queue.list.push(track);
                if (this.queue.list.length === 1 && !this.queue.current) {
                    this.queue.setCurrent(track);
                    this.manager.emit(constants_1.PlayerEvents.QUEUE_START, urls, this.textChannel);
                    await this.requestManager.setCurrentStream(track);
                    this.play();
                }
                if (i !== urls.length - 1) {
                    await (0, promises_2.setTimeout)(this.manager.config.playerOptions?.trackInfoInterval ?? 5000);
                }
            }
        }
        else if (type === 3) {
            if ((0, helpers_1.isMix)(urls[urls.length - 1])) {
                this.extraData.youtube.mixIndex = urls.length - 1;
                this.extraData.youtube.mixLastUrl = urls[urls.length - 1];
            }
            for (let i = 0; i < urls.length; i++) {
                if (this.reseted) {
                    this.reseted = false;
                    break;
                }
                const info = await this.manager.searchManager.youtube.getInfo(urls[i]);
                if (!info) {
                    console.error(`Cannot Get Data Of ${urls[i]}`);
                    continue;
                }
                info["rawQuery"] = urls[i];
                const track = new Track_1.default({
                    requestUser: member,
                    rawinfo: info,
                    type,
                }, this);
                this.queue.list.push(track);
                if (this.queue.list.length === 1 && !this.queue.current) {
                    this.queue.setCurrent(track);
                    this.manager.emit(constants_1.PlayerEvents.QUEUE_START, urls, this.textChannel);
                    await this.requestManager.setCurrentStream(track);
                    this.play();
                }
                if (i !== urls.length - 1) {
                    await (0, promises_2.setTimeout)(this.manager.config.playerOptions?.trackInfoInterval ?? 5000);
                }
            }
        }
        else
            throw new Error(`Invalid Type: '${type}' Provided`);
        return urls.length === 1
            ? this.queue.list[this.queue.list.length - 1].info.title
            : urls.length;
    }
    play() {
        const resource = this.requestManager.currentStream;
        resource.volume.setVolume(this.options.volume / 100);
        this.player.play(resource);
        this.manager.emit(constants_1.PlayerEvents.TRACK_START, this.queue.current, this.textChannel);
        if (this.queue.current.rawInfo.rawQuery === this.extraData.youtube.mixLastUrl) {
            this.extraData.youtube.mixIndex += 25;
            this.search(this.queue.current.rawInfo.rawQuery, 3).then(async (res) => {
                if (res.length > 0) {
                    await this.addTrack({
                        urls: res.slice(1),
                        type: 3,
                        member: this.queue.current.requestUser,
                    });
                }
            });
        }
    }
    //@ts-ignore
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
            if (os.status !== voice_1.AudioPlayerStatus.Idle &&
                ns.status === voice_1.AudioPlayerStatus.Idle) {
                if (this.options.paused) {
                }
                else if (this.options.mode === constants_1.LoopMode.Track && this.queue.current) {
                    this.manager.emit(constants_1.PlayerEvents.TRACK_END, this.queue.current, this.textChannel);
                    this._playSingleTrack();
                }
                else if (this.options.mode === constants_1.LoopMode.Queue &&
                    this.queue.list.length) {
                    this.manager.emit(constants_1.PlayerEvents.TRACK_END, this.queue.current, this.textChannel);
                    await this._loopQueue();
                }
                else if (this.options.autoPlay && this.queue.list.length === 1) {
                    this.manager.emit(constants_1.PlayerEvents.TRACK_END, this.queue.current, this.textChannel);
                    this._autoPlay();
                }
                else if (this.queue.list.length > 1) {
                    this.manager.emit(constants_1.PlayerEvents.TRACK_END, this.queue.current, this.textChannel);
                    await this._playNextTrack();
                }
                else {
                    this.manager.emit(constants_1.PlayerEvents.TRACK_END, this.queue.current, this.textChannel);
                    this.manager.emit(constants_1.PlayerEvents.QUEUE_END, this.textChannel);
                    if (this.options.leaveAfter.enabled) {
                        (0, timers_1.setTimeout)(() => {
                            this.leaveVc();
                        }, this.options.leaveAfter.time);
                    }
                    this._destroyPlayer();
                }
            }
            if (os.status === voice_1.AudioPlayerStatus.Playing &&
                ns.status !== voice_1.AudioPlayerStatus.Playing &&
                ns.status !== voice_1.AudioPlayerStatus.Idle && ns.status !== voice_1.AudioPlayerStatus.Paused) {
                this.manager.emit(constants_1.PlayerEvents.TRACK_END, this.queue.current, this.textChannel);
            }
        });
        this.player.on("error", async (error) => {
            this.manager.emit(constants_1.PlayerEvents.AUDIO_ERROR, error, this.textChannel);
        });
        if (this.debug) {
            this.player.on("debug", (msg) => this.debug ? console.log(msg) : undefined);
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
            autoPlay: null,
            seekWhenFilter: false,
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
        if (this.manager.config.cache.cacheType === "Disk") {
            if ((0, fs_1.existsSync)(`music/${this.textChannel.guildId}`)) {
                (0, promises_1.rm)(`music/${this.textChannel.guildId}`, {
                    recursive: true,
                    force: true,
                });
            }
        }
        this.options.autoPlay = null;
        this.options.mode = constants_1.LoopMode.None;
        this.options.volume = 100;
        this.queue = new Queue_1.default();
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
    loop(mode) {
        this.options.mode = mode;
    }
    skip() {
        this.player.stop();
    }
    async _autoPlay() {
        if (this.options.autoPlay === "soundcloud") {
            const data = await this.manager.searchManager.soundcloud.related(this.queue.current.rawInfo.id, 10);
            if (!data[0]) {
                this._destroyPlayer();
                console.error("failed to get next track");
            }
            else {
                for (const d of data) {
                    this.queue.list.push(new Track_1.default({
                        requestUser: this.textChannel.guild.me,
                        rawinfo: d,
                        type: 0,
                    }, this));
                }
            }
        }
        else if (this.options.autoPlay === "youtube") {
            const data = await this.manager.searchManager.youtube.related(this.queue.current.rawInfo.details.id, 5);
            for (const d of data) {
                this.queue.list.push(new Track_1.default({
                    requestUser: this.textChannel.guild.me,
                    rawinfo: d,
                    type: 3,
                }, this));
            }
        }
        else if (this.options.autoPlay === "relative") {
            if (!["youtube", "soundcloud"].includes(this.queue.current.info.identifier.toLowerCase())) {
                this._destroyPlayer();
                console.error("Relative only supports Youtube And Soundcloud");
            }
            const data = await this.manager.searchManager[this.queue.current.info.identifier.toLowerCase()].related(this.queue.current.info.identifier.toLowerCase() === "youtube"
                ? this.queue.current.rawInfo.details.id
                : this.queue.current.rawInfo.id, 5);
            for (const d of data) {
                this.queue.list.push(new Track_1.default({
                    requestUser: this.textChannel.guild.me,
                    rawinfo: d,
                    type: this.queue.current.info.identifier.toLowerCase() ===
                        "soundcloud"
                        ? 0
                        : 3,
                }, this));
            }
        }
        await this._playNextTrack();
    }
    pause() {
        this.options.paused = true;
        this.player.pause(true);
        this.manager.emit(constants_1.PlayerEvents.TRACK_PAUSE);
    }
    resume() {
        this.options.paused = false;
        this.player.unpause();
        this.manager.emit(constants_1.PlayerEvents.TRACK_RESUME);
    }
    getQueue(page = 1, limit = 10, customResponse = `[{title}]({url}) | {user.id}`) {
        let [current, previous, list] = [
            this.queue.current,
            this.queue.previous,
            this.queue.list,
        ];
        try {
            const props = customResponse.match(/{([^}]+)}/g);
            const queue = [];
            let i = 0;
            list = list.slice((page - 1) * limit, page * limit);
            const options = props.map((x) => x.replace("{", "").replace("}", ""));
            while (i < list.length) {
                let res = customResponse;
                let x = list[i];
                props.forEach((y, a) => {
                    res = res.replace(y, y === "{position}"
                        ? i + 1
                        : y.startsWith("{user.")
                            ? x.requestUser.user[options[a].split(".")[1]]
                            : y.startsWith("{member.")
                                ? x.requestUser[options[a].split(".")[1]]
                                : x.info[options[a]]);
                });
                queue.push(res);
                i++;
            }
            return { current, previous, queue };
        }
        catch (e) {
            console.error(e);
        }
    }
    leaveVc() {
        this.connection.destroy();
        this.manager.players.delete(this.voiceChannel.guildId);
    }
    removeTrack(trackPosition) {
        this.queue.list.splice(trackPosition, 1);
    }
    shuffleQueue() {
        this.queue.list = (0, helpers_1.shuffle)(this.queue.list);
    }
    skipTo(number) {
        if (this.options.mode != constants_1.LoopMode.Queue) {
            const a = this.queue.list.splice(0, number);
            this.player.stop();
            return a;
        }
        else {
            const spliced = this.queue.list.splice(0, number);
            this.queue.list.push(...spliced);
            this.player.stop();
            return spliced;
        }
    }
    stop() {
        this.queue.list = [];
        this.player.stop();
        this.reseted = true;
    }
    set volume(volume) {
        this.options.volume = volume;
        this.requestManager._setVolume(volume / 100);
    }
    get volume() {
        return this.options.volume;
    }
    _configConnection() {
        this.connection.on("stateChange", async (_, newState) => {
            if (newState.status === voice_1.VoiceConnectionStatus.Disconnected) {
                if (newState.reason ===
                    voice_1.VoiceConnectionDisconnectReason.WebSocketClose &&
                    newState.closeCode === 4014) {
                    try {
                        await (0, voice_1.entersState)(this.connection, voice_1.VoiceConnectionStatus.Connecting, 5000);
                    }
                    catch {
                        this.connection.destroy();
                        this.manager.players.delete(this.textChannel.guildId);
                    }
                }
                else if (this.connection.rejoinAttempts < 5) {
                    await (0, promises_2.setTimeout)((this.connection.rejoinAttempts + 1) * 5000);
                    this.connection.rejoin();
                }
                else {
                    this.connection.destroy();
                    this.manager.players.delete(this.textChannel.guildId);
                }
            }
            else if (newState.status === voice_1.VoiceConnectionStatus.Destroyed) {
                this.stop();
            }
        });
    }
}
exports.default = Player;
//# sourceMappingURL=Player.js.map