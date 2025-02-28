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
const spotify_url_info_1 = __importDefault(require("spotify-url-info"));
const spotify_web_api_node_1 = __importDefault(require("spotify-web-api-node"));
const voice_1 = require("@discordjs/voice");
const index_1 = require("tiny-typed-emitter/lib/index");
const youtubei_js_1 = require("youtubei.js");
const audioPlayer_1 = require("./audioPlayer");
const soundcloud_downloader_1 = __importDefault(require("soundcloud-downloader"));
const undici_1 = require("undici");
const enums_1 = require("../typings/enums");
const jsdom_1 = require("jsdom");
const bgutils_js_1 = require("bgutils-js");
const fs_1 = require("fs");
const path_1 = require("path");
class Manager extends index_1.TypedEmitter {
    constructor(config) {
        super();
        _Manager_instances.add(this);
        this.plugins = new Map();
        __classPrivateFieldGet(this, _Manager_instances, "m", _Manager_validateConfig).call(this, config);
        this.configs = config ?? Manager.defaultConfig();
        this.players = new Map();
        const ytoptions = {
            youtubeCookie: ""
        };
        if (config.searchOptions?.youtubeCookie) {
            ytoptions.cookie = config.searchOptions?.youtubeCookie;
        }
        if (config.searchOptions?.youtubegl) {
            ytoptions.cookie = config.searchOptions?.youtubegl ?? "US";
        }
        if (config.searchOptions?.youtubeToken ?? true) {
            /*
             * This function generates a YouTube PoToken using BotGuard.
             * https://github.com/LuanRT/BgUtils/blob/main/examples/node/main.mjs
             */
            async function generateYoutubePoToken() {
                let innertube = await youtubei_js_1.Innertube.create({ retrieve_player: false });
                const requestKey = "O43z0dpjhgX20SCx4KAo";
                const visitorData = innertube.session.context.client.visitorData;
                const dom = new jsdom_1.JSDOM();
                Object.assign(globalThis, {
                    window: dom.window,
                    document: dom.window.document
                });
                const bgConfig = {
                    // @ts-ignore
                    fetch: (input, init) => (0, undici_1.fetch)(input, init),
                    globalObj: globalThis,
                    identifier: visitorData,
                    requestKey
                };
                return bgutils_js_1.BG.Challenge.create(bgConfig)
                    .then(async (challenge) => {
                    if (!challenge)
                        throw new Error("[@aoijs/aoi.music]: Could not get challenge, remove the youtubeToken option if this error persists");
                    const interpreterJavascript = challenge.interpreterJavascript.privateDoNotAccessOrElseSafeScriptWrappedValue;
                    if (interpreterJavascript) {
                        new Function(interpreterJavascript)();
                    }
                    else
                        throw new Error("[aoi.music]: Could not create VM, set the youtubeToken option to 'false' if this error persists");
                    const poTokenResult = await bgutils_js_1.BG.PoToken.generate({
                        program: challenge.program,
                        globalName: challenge.globalName,
                        bgConfig
                    });
                    /*
                    #DEBUG POT generation
                      const placeholderPoToken = BG.PoToken.generatePlaceholder(visitorData);

                      console.info("Session Info:", {
                        visitorData,
                        placeholderPoToken,
                        poToken: poTokenResult.poToken,
                        integrityTokenData: poTokenResult.integrityTokenData,
                      });
                    */
                    if (!poTokenResult.poToken) {
                        throw new Error("[aoi.music]: Could not generate POT, set the youtubeToken option to 'false' if this error persists");
                    }
                    return poTokenResult.poToken;
                })
                    .then((poToken) => {
                    const authPath = (0, path_1.join)(__dirname, "./credentials.json");
                    if (!(0, fs_1.existsSync)(authPath)) {
                        (0, fs_1.writeFileSync)(authPath, "{}");
                    }
                    const credentials = JSON.parse((0, fs_1.readFileSync)(authPath, "utf-8"));
                    credentials.poToken = poToken;
                    credentials.visitorData = visitorData;
                    (0, fs_1.writeFileSync)(authPath, JSON.stringify(credentials));
                    if (config.devOptions?.debug) {
                        console.log("#DEBUG PoToken:", poToken);
                        console.log("#DEBUG VisitorData:", visitorData);
                    }
                    ytoptions.potoken = { token: poToken, visitorData };
                })
                    .catch((error) => {
                    console.error("[@aoijs/aoi.music]: Failed to generate YouTube PoToken:", error);
                });
            }
            generateYoutubePoToken();
        }
        // prevent future class changes from being logged to console
        // so people don't get confused about those *absolutely* irrelevant logs
        youtubei_js_1.Log.setLevel(youtubei_js_1.Log.Level.NONE);
        const youtubeOptions = {
            cache: new youtubei_js_1.UniversalCache(true)
        };
        if (ytoptions.potoken?.token && ytoptions.potoken?.visitorData) {
            youtubeOptions.po_token = ytoptions.potoken.token;
            youtubeOptions.visitor_data = ytoptions.potoken.visitorData;
        }
        if (ytoptions.youtubeCookie) {
            youtubeOptions.cookies = ytoptions.youtubeCookie;
        }
        this.platforms = {
            youtube: youtubei_js_1.Innertube.create(youtubeOptions),
            soundcloud: soundcloud_downloader_1.default,
            spotify: (0, spotify_url_info_1.default)(undici_1.fetch)
        };
        if (config.searchOptions?.spotifyAuth?.clientId && config.searchOptions?.spotifyAuth?.clientSecret) {
            this.spotifyApi = new spotify_web_api_node_1.default({
                clientId: config.searchOptions?.spotifyAuth?.clientId,
                clientSecret: config.searchOptions?.spotifyAuth?.clientSecret
            });
            this.spotifyApi.clientCredentialsGrant().then((data) => {
                this.spotifyApi.setAccessToken(data.body.access_token);
            });
            setInterval(() => {
                this.spotifyApi.clientCredentialsGrant().then((data) => {
                    this.spotifyApi.setAccessToken(data.body.access_token);
                });
            }, 36e5);
        }
        if (config.searchOptions?.soundcloudClientId) {
            this.platforms.soundcloud.setClientID(config.searchOptions.soundcloudClientId);
        }
        // Youtube nuked oAuth for non-tv clients
        if (config.searchOptions?.youtubeAuth === true) {
            this.platforms.youtube.then(async (yt) => {
                // should be inside of node_modules
                const authPath = (0, path_1.join)(__dirname, "./credentials.json");
                let authData = {};
                if (!(0, fs_1.existsSync)(authPath)) {
                    (0, fs_1.writeFileSync)(authPath, "{}");
                }
                if ((0, fs_1.existsSync)(authPath)) {
                    const fileContent = (0, fs_1.readFileSync)(authPath, "utf8");
                    authData = JSON.parse(fileContent);
                }
                yt.session.on("auth-pending", (data) => {
                    console.log(`[@aoijs/aoi.music]: Sign in pending: visit ${data.verification_url} and enter ${data.user_code} to sign in.`);
                });
                const updateCredentials = (credentials) => {
                    const current = JSON.parse((0, fs_1.readFileSync)(authPath, "utf-8"));
                    const { visitorData, poToken } = current;
                    const newCredentials = {
                        visitorData,
                        poToken,
                        ...credentials
                    };
                    (0, fs_1.writeFileSync)(authPath, JSON.stringify(newCredentials));
                };
                yt.session.on("auth", ({ credentials }) => {
                    yt.session.oauth.cacheCredentials();
                    updateCredentials(credentials);
                    console.log("[@aoijs/aoi.music]: Successfully signed in.");
                });
                yt.session.on("update-credentials", ({ credentials }) => {
                    yt.session.oauth.cacheCredentials();
                    updateCredentials(credentials);
                });
                // check if access_token exists in file, if not skip to signin
                if ((0, fs_1.existsSync)(authPath) && JSON.parse((0, fs_1.readFileSync)(authPath, "utf-8")).access_token) {
                    try {
                        const credentials = JSON.parse((0, fs_1.readFileSync)(authPath, "utf-8"));
                        // remove unneeded data
                        delete credentials.visitorData;
                        delete credentials.poToken;
                        console.log("[@aoijs/aoi.music]: Attempting to sign in with cached credentials.");
                        await yt.session.signIn(credentials);
                    }
                    catch {
                        console.warn("[@aoijs/aoi.music]: Failed to sign in with cached credentials, please reauthenticate.");
                        const { visitorData, poToken } = JSON.parse((0, fs_1.readFileSync)(authPath, "utf-8"));
                        (0, fs_1.writeFileSync)(authPath, JSON.stringify({ visitorData, poToken }, null, 2));
                        yt.session.oauth.removeCache();
                        await yt.session.signIn();
                    }
                }
                else {
                    yt.session.signIn();
                }
            });
        }
    }
    static defaultConfig() {
        return {
            devOptions: {
                debug: false
            },
            searchOptions: {
                soundcloudClientId: undefined,
                youtubeCookie: undefined,
                youtubeToken: true,
                youtubegl: "US",
                youtubeClient: "WEB_EMBEDDED",
                spotifyAuth: {
                    clientId: undefined,
                    clientSecret: undefined
                }
            },
            requestOptions: {
                offsetTimeout: 500,
                soundcloudLikeTrackLimit: -1,
                youtubePlaylistLimit: -1,
                spotifyPlaylistLimit: -1
            }
        };
    }
    async joinVc({ type = "default", voiceChannel, selfDeaf = true, selfMute = false, adapter }) {
        const data = {
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            selfDeaf,
            selfMute,
            adapterCreator: (adapter ? adapter : voiceChannel.guild?.voiceAdapterCreator ?? adapter),
            group: voiceChannel.client.user.id
        };
        // destory player if already exists to prevent memory leaks
        if (this.players.has(data.guildId)) {
            const player = this.players.get(data.guildId);
            player?._destroy();
            this.players.delete(data.guildId);
            player.options.connection.destroy();
        }
        const connection = (0, voice_1.joinVoiceChannel)(data);
        connection.on("error", console.error);
        try {
            await (0, voice_1.entersState)(connection, voice_1.VoiceConnectionStatus.Ready, 30000);
            this.players.set(voiceChannel.guildId, new audioPlayer_1.AudioPlayer({
                type,
                connection,
                voiceChannel: voiceChannel.id,
                manager: this,
                debug: this.configs.devOptions?.debug ?? false
            }));
            if (this.configs.devOptions?.debug) {
                console.log(`#DEBUG:\n Class -> Manager \n Method -> joinVc \n Message -> Joined Voice Channel ${voiceChannel.name} in Guild ${voiceChannel.guild.name}`);
            }
            return true;
        }
        catch (error) {
            connection.destroy();
            if (this.configs.devOptions?.debug) {
                console.log(`#DEBUG:\n Class -> Manager \n Method -> joinVc \n Message -> Failed to join Voice Channel ${voiceChannel.name} in Guild ${voiceChannel.guild.name}`);
            }
            return false;
        }
    }
    async search(type, query, limit = 1) {
        if (type === enums_1.PlatformType.Youtube) {
            const yt = await this.platforms.youtube;
            const res = await yt.search(query, {
                type: "video"
            });
            return res.videos.slice(0, limit);
        }
        else if (type === enums_1.PlatformType.SoundCloud) {
            const sc = this.platforms.soundcloud;
            const res = await sc.search({
                query,
                limit,
                offset: 0,
                resourceType: "tracks"
            });
            return res.collection;
        }
        else if (type === enums_1.PlatformType.Spotify) {
            const res = await this.spotifyApi.searchTracks(query, {
                limit
            });
            return res.body.tracks.items;
        }
    }
    addPlugin(name, plugin) {
        this.plugins.set(name, plugin);
        if (this.configs.devOptions?.debug) {
            console.log(`#DEBUG:\n Class -> Manager \n Method -> addPlugin \n Message -> Added Plugin ${plugin.constructor.name} with name : ${name} `);
        }
    }
    leaveVc(guildId) {
        const player = this.players.get(guildId);
        player?._destroy();
        this.players.delete(guildId);
        return player.options.connection.destroy();
    }
}
exports.Manager = Manager;
_Manager_instances = new WeakSet(), _Manager_validateConfig = function _Manager_validateConfig(config) {
    if (config.requestOptions?.offsetTimeout && (typeof config.requestOptions.offsetTimeout !== "number" || config.requestOptions.offsetTimeout < 0)) {
        throw new Error(`Invalid Time Provided in ManagerConfig#requestOptions['offsetTimeout']`);
    }
    else if (config.requestOptions?.soundcloudLikeTrackLimit && (typeof config.requestOptions.soundcloudLikeTrackLimit !== "number" || config.requestOptions.soundcloudLikeTrackLimit < -1)) {
        throw new Error(`Invalid Limit Provided in ManagerConfig#requestOptions['soundcloudLikeTrackLimit']`);
    }
    else if (config.requestOptions?.youtubePlaylistLimit && (typeof config.requestOptions.youtubePlaylistLimit !== "number" || config.requestOptions.youtubePlaylistLimit < -1)) {
        throw new Error(`Invalid Limit Provided in ManagerConfig#requestOptions['youtubePlaylistLimit']`);
    }
    else if (config.requestOptions?.spotifyPlaylistLimit && (typeof config.requestOptions.spotifyPlaylistLimit !== "number" || config.requestOptions.spotifyPlaylistLimit < -1)) {
        throw new Error(`Invalid Limit Provided in ManagerConfig#requestOptions['spotifyPlaylistLimit']`);
    }
    else if (config.devOptions?.debug && typeof config.devOptions.debug !== "boolean") {
        throw new Error(`Invalid Debug Option Provided in ManagerConfig#devOptions['debug']`);
    }
    if (config.devOptions?.debug) {
        console.log("Debug Mode Enabled");
    }
};
//# sourceMappingURL=manager.js.map