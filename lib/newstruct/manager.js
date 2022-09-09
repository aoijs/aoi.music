"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _Manager_instances, _Manager_validateConfig;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Manager = void 0;
const voice_1 = require("@discordjs/voice");
const fs_1 = require("fs");
const tiny_typed_emitter_1 = require("tiny-typed-emitter");
const youtubei_js_1 = __importDefault(require("youtubei.js"));
const audioPlayer_1 = require("./audioPlayer");
const soundcloud_downloader_1 = __importDefault(require("soundcloud-downloader"));
const spotify_url_info_1 = __importDefault(require("spotify-url-info"));
const undici_1 = require("undici");
class Manager extends tiny_typed_emitter_1.TypedEmitter {
    constructor(config) {
        super();
        _Manager_instances.add(this);
        __classPrivateFieldGet(this, _Manager_instances, "m", _Manager_validateConfig).call(this, config);
        this.configs = config ?? Manager.defaultConfig();
        this.players = new Map();
        const ytoptions = {};
        if (config.searchOptions?.youtubeCookie) {
            ytoptions.cookie = config.searchOptions?.youtubeCookie;
        }
        if (config.searchOptions?.youtubegl) {
            ytoptions.cookie = config.searchOptions?.youtubegl ?? 'US';
        }
        this.platforms = {
            youtube: youtubei_js_1.default.create(),
            soundcloud: soundcloud_downloader_1.default,
            spotify: (0, spotify_url_info_1.default)(undici_1.fetch),
        };
        if (config.searchOptions.soundcloudClientId) {
            this.platforms.soundcloud.setClientID(config.searchOptions.soundcloudClientId);
        }
        if (config.searchOptions?.youtubeAuth) {
            const cred = JSON.parse((0, fs_1.readFileSync)(config.searchOptions?.youtubeAuth).toString());
            this.platforms.youtube.then(d => d.session.signIn(cred));
        }
    }
    static defaultConfig() {
        return {
            devOptions: {
                debug: false,
            },
            searchOptions: {
                soundcloudClientId: undefined,
                youtubeCookie: undefined,
                youtubeAuth: undefined,
                youtubegl: 'US',
                youtubeClient: "WEB"
            },
            requestOptions: {
                offsetTimeout: 500,
                soundcloudLikeTrackLimit: -1,
                youtubePlaylistLimit: -1,
                spotifyPlaylistLimit: -1,
            },
        };
    }
    async joinVc({ type = "default", voiceChannel, selfDeaf = true, selfMute = false, }) {
        const data = {
            channelId: voiceChannel.id,
            guildId: voiceChannel.guildId,
            selfDeaf,
            selfMute,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            group: voiceChannel.client.user.id,
        };
        const connection = (0, voice_1.joinVoiceChannel)(data);
        connection.on("error", console.error);
        try {
            await (0, voice_1.entersState)(connection, voice_1.VoiceConnectionStatus.Ready, 30000);
            this.players.set(voiceChannel.guildId, new audioPlayer_1.AudioPlayer({
                type,
                connection,
                voiceChannel: voiceChannel.id,
                manager: this,
                debug: this.configs.devOptions?.debug ?? false,
            }));
        }
        catch (error) {
            connection.destroy();
            throw error;
        }
        if (this.configs.devOptions?.debug) {
            connection.on("debug", console.log);
        }
    }
}
exports.Manager = Manager;
_Manager_instances = new WeakSet(), _Manager_validateConfig = function _Manager_validateConfig(config) {
    if (config.requestOptions?.offsetTimeout && (typeof config.requestOptions.offsetTimeout !== "number" || config.requestOptions.offsetTimeout < 0)) {
        throw new Error(`Invalid Time Provided in ManagerConfig#requestOptions['offsetTimeout']`);
    }
    else if (config.requestOptions?.soundcloudLikeTrackLimit && (typeof config.requestOptions.soundcloudLikeTrackLimit !== "number" ||
        config.requestOptions.soundcloudLikeTrackLimit < -1)) {
        throw new Error(`Invalid Limit Provided in ManagerConfig#requestOptions['soundcloudLikeTrackLimit']`);
    }
    else if (config.requestOptions?.youtubePlaylistLimit && (typeof config.requestOptions.youtubePlaylistLimit !== "number" ||
        config.requestOptions.youtubePlaylistLimit < -1)) {
        throw new Error(`Invalid Limit Provided in ManagerConfig#requestOptions['youtubePlaylistLimit']`);
    }
    else if (config.requestOptions?.spotifyPlaylistLimit && (typeof config.requestOptions.spotifyPlaylistLimit !== "number" ||
        config.requestOptions.spotifyPlaylistLimit < -1)) {
        throw new Error(`Invalid Limit Provided in ManagerConfig#requestOptions['spotifyPlaylistLimit']`);
    }
    else if (config.searchOptions?.youtubeAuth && !(0, fs_1.existsSync)(config.searchOptions.youtubeAuth)) {
        throw new Error(`Invalid Auth Path Provided in ManagerConfig#searchOptions['youtubeAuth']`);
    }
};
//# sourceMappingURL=manager.js.map