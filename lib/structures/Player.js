"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dist_1 = require("../../node_modules/@discordjs/voice/dist");
const constants_1 = require("../utils/constants");
const dist_2 = require("../../node_modules/@discordjs/voice/dist");
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
        this.player = new dist_2.AudioPlayer();
        this.connection = data.connection;
        this.voiceChannel = data.voiceChannel;
        this.textChannel = data.textChannel;
        this.manager = data.manager;
        this.requestManager = new requestManager_1.default(this);
        this._defaultOptions();
        this.debug = data.debug;
        this._configPlayer();
    }
    get state() { return constants_1.PlayerStates[this._state]; }
    ;
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
    async addTrack({ urls, type, member }) {
        if (type === 0) {
            for (const url of urls) {
                const info = await this.manager.searchManager.soundCloud.getInfo(url);
                if (!info) {
                    console.error(`Cannot Get Data Of ${url}`);
                    continue;
                }
                const track = new Track_1.default({ requestUser: member, rawinfo: info, type });
                this.queue.list.push(track);
                if (this.queue.list.length === 1) {
                    this.queue.setCurrent(track);
                    await this.requestManager.setCurrentStream(track);
                    this.play();
                }
                if (this.queue.list.length === 2) {
                    this.requestManager.setNextStream(this.queue.list[1]);
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
                const track = new Track_1.default({ requestUser: member, rawinfo: info, type });
                this.queue.list.push(track);
                if (this.queue.list.length === 1) {
                    this.queue.setCurrent(track);
                    await this.requestManager.setCurrentStream(track);
                    this.play();
                }
                if (this.queue.list.length === 2) {
                    this.requestManager.setNextStream(this.queue.list[1]);
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
                const track = new Track_1.default({ requestUser: member, rawinfo: info, type });
                this.queue.list.push(track);
                if (this.queue.list.length === 1) {
                    this.queue.setCurrent(track);
                    await this.requestManager.setCurrentStream(track);
                    this.play();
                }
                if (this.queue.list.length === 2) {
                    this.requestManager.setNextStream(this.queue.list[1]);
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
    ;
    join(channel) {
        this.voiceState.connection = (0, dist_1.joinVoiceChannel)({
            channelId: channel.id,
            guildId: channel.guildId,
            adapterCreator: channel.guild.voiceAdapterCreator,
            group: channel.client.user.id
        });
        this.voiceState.channel = channel;
    }
    ;
    _configPlayer() {
        this.player.on("stateChange", async (os, ns) => {
            console.log([os.status, ns.status]?.join("|"));
            if (os.status !== dist_1.AudioPlayerStatus.Idle && ns.status === dist_1.AudioPlayerStatus.Idle) {
                if (this.options.paused)
                    return;
                else if (this.options.mode === constants_1.LoopMode.Track && this.queue.current) {
                    //this._playSingleTrack()
                }
                else if (this.options.mode === constants_1.LoopMode.Queue && this.queue.list.length) {
                    //this._loopQueue()
                }
                else if (this.queue.list.length > 1) {
                    this._playNextTrack();
                }
                else {
                    //this._destroyPlayer()
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
            leaveWhenVcEmpty: false
        };
    }
    _playNextTrack() {
        const track = this.queue.list.shift();
        this.queue.previous = track;
        this.queue.current = this.queue.list[0];
        this.requestManager.currentStream = this.requestManager.nextStream;
        this.requestManager.setNextStream(this.queue.current);
        this.play();
    }
}
exports.default = Player;
//# sourceMappingURL=Player.js.map