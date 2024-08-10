import sui, { Spotify } from "spotify-url-info";
import SpotifyWebApi from "spotify-web-api-node";
import { DiscordGatewayAdapterCreator, entersState, joinVoiceChannel, VoiceConnectionStatus } from "@discordjs/voice";
import { Snowflake, VoiceBasedChannel } from "discord.js";
import { TypedEmitter } from "tiny-typed-emitter/lib/index";
import { Innertube, UniversalCache } from "youtubei.js";
import IT from "youtubei.js";
import { AudioPLayerOptions, ManagerConfigurations, ManagerEvents } from "../typings/interfaces";
import { AudioPlayer } from "./audioPlayer";
import scdl from "soundcloud-downloader";
import { SCDL } from "soundcloud-downloader/src";
import { fetch } from "undici";
import { PlatformType, PluginName } from "../typings/enums";
import { TrackInfo } from "soundcloud-downloader/src/info";
import { Plugin } from "../typings/types";
import { existsSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import { join } from "path";

export class Manager extends TypedEmitter<ManagerEvents> {
    configs: ManagerConfigurations;
    players: Map<Snowflake, AudioPlayer>;
    platforms: { youtube: Promise<IT>; spotify?: Spotify; soundcloud: SCDL };
    plugins: Map<PluginName, Plugin<PluginName>> = new Map<PluginName, Plugin<PluginName>>();
    spotifyApi: SpotifyWebApi;

    constructor(config?: ManagerConfigurations) {
        super();
        this.#validateConfig(config);
        this.configs = config ?? Manager.defaultConfig();
        this.players = new Map();
        const ytoptions: {
            gl?: string;
            cookie?: string;
            debug?: boolean;
        } = {};
        if (config.searchOptions?.youtubeCookie) {
            ytoptions.cookie = config.searchOptions?.youtubeCookie;
        }
        if (config.searchOptions?.youtubegl) {
            ytoptions.cookie = config.searchOptions?.youtubegl ?? "US";
        }
        this.platforms = {
            youtube: Innertube.create({
                cache: new UniversalCache(true)
            }),
            soundcloud: scdl,
            spotify: sui(fetch)
        };

        if (config.searchOptions?.spotifyAuth?.clientId && config.searchOptions?.spotifyAuth?.clientSecret) {
            this.spotifyApi = new SpotifyWebApi({
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
        if (config.searchOptions?.youtubeAuth === true) {
            this.platforms.youtube.then(async (yt) => {
                // should be inside of node_modules
                const authPath = join(__dirname, "./credentials.json");

                yt.session.on("auth-pending", (data) => {
                    console.log(`[@aoijs/aoi.music]: Sign in pending: visit ${data.verification_url} and enter ${data.user_code} to sign in.`);
                });

                yt.session.on("auth", ({ credentials }) => {
                    yt.session.oauth.cacheCredentials();
                    writeFileSync(authPath, JSON.stringify(credentials));
                    console.log("[@aoijs/aoi.music]: Successfully signed in.");
                });
    
                yt.session.on("update-credentials", ({ credentials }) => {
                    yt.session.oauth.cacheCredentials();
                    writeFileSync(authPath, JSON.stringify(credentials));
                });

                if (existsSync(authPath)) {
                    try {
                        const credentials = JSON.parse(readFileSync(authPath, "utf-8"));
                        console.log("[@aoijs/aoi.music]: Attempting to sign in with cached credentials.");
                        await yt.session.signIn(credentials);
                    } catch {
                        console.warn("[@aoijs/aoi.music]: Failed to sign in with cached credentials, please reauthenticate.");
                        unlinkSync(authPath);
                        yt.session.oauth.removeCache();
                        await yt.session.signIn();
                    }
                } else {
                    yt.session.signIn();
                }
            });
        }
    }

    static defaultConfig(): ManagerConfigurations {
        return {
            devOptions: {
                debug: false
            },
            searchOptions: {
                soundcloudClientId: undefined,
                youtubeCookie: undefined,
                youtubeAuth: true,
                youtubegl: "US",
                youtubeClient: "TV_EMBEDDED",
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

    #validateConfig(config: ManagerConfigurations) {
        if (config.requestOptions?.offsetTimeout && (typeof config.requestOptions.offsetTimeout !== "number" || config.requestOptions.offsetTimeout < 0)) {
            throw new Error(`Invalid Time Provided in ManagerConfig#requestOptions['offsetTimeout']`);
        } else if (config.requestOptions?.soundcloudLikeTrackLimit && (typeof config.requestOptions.soundcloudLikeTrackLimit !== "number" || config.requestOptions.soundcloudLikeTrackLimit < -1)) {
            throw new Error(`Invalid Limit Provided in ManagerConfig#requestOptions['soundcloudLikeTrackLimit']`);
        } else if (config.requestOptions?.youtubePlaylistLimit && (typeof config.requestOptions.youtubePlaylistLimit !== "number" || config.requestOptions.youtubePlaylistLimit < -1)) {
            throw new Error(`Invalid Limit Provided in ManagerConfig#requestOptions['youtubePlaylistLimit']`);
        } else if (config.requestOptions?.spotifyPlaylistLimit && (typeof config.requestOptions.spotifyPlaylistLimit !== "number" || config.requestOptions.spotifyPlaylistLimit < -1)) {
            throw new Error(`Invalid Limit Provided in ManagerConfig#requestOptions['spotifyPlaylistLimit']`);
        } else if (config.devOptions?.debug && typeof config.devOptions.debug !== "boolean") {
            throw new Error(`Invalid Debug Option Provided in ManagerConfig#devOptions['debug']`);
        }
        if (config.devOptions?.debug) {
            console.log("Debug Mode Enabled");
        }
    }

    async joinVc({
        type = "default",
        voiceChannel,
        selfDeaf = true,
        selfMute = false,
        adapter
    }: {
        type: AudioPLayerOptions["type"];
        voiceChannel: VoiceBasedChannel;
        selfDeaf?: boolean;
        selfMute?: boolean;
        adapter?: any;
    }): Promise<boolean> {
        const data = {
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            selfDeaf,
            selfMute,
            adapterCreator: <
                DiscordGatewayAdapterCreator // @ts-ignore
            >(adapter ? adapter : <unknown>voiceChannel.guild?.voiceAdapterCreator ?? adapter),
            group: voiceChannel.client.user.id
        };
        const connection = joinVoiceChannel(data);
        connection.on("error", console.error);
        try {
            await entersState(connection, VoiceConnectionStatus.Ready, 30000);
            this.players.set(
                voiceChannel.guildId,
                new AudioPlayer({
                    type,
                    connection,
                    voiceChannel: voiceChannel.id,
                    manager: this,
                    debug: this.configs.devOptions?.debug ?? false
                })
            );
            if (this.configs.devOptions?.debug) {
                console.log(`#DEBUG:\n Class -> Manager \n Method -> joinVc \n Message -> Joined Voice Channel ${voiceChannel.name} in Guild ${voiceChannel.guild.name}`);
            }
            return true;
        } catch (error) {
            connection.destroy();
            if (this.configs.devOptions?.debug) {
                console.log(`#DEBUG:\n Class -> Manager \n Method -> joinVc \n Message -> Failed to join Voice Channel ${voiceChannel.name} in Guild ${voiceChannel.guild.name}`);
            }
            return false;
        }
    }

    async search<T extends PlatformType>(type: T, query: string, limit = 1) {
        if (type === PlatformType.Youtube) {
            const yt = await this.platforms.youtube;
            const res = await yt.search(query, {
                type: "video"
            });
            return res.videos.slice(0, limit);
        } else if (type === PlatformType.SoundCloud) {
            const sc = this.platforms.soundcloud;
            const res = await sc.search({
                query,
                limit,
                offset: 0,
                resourceType: "tracks"
            });
            return <TrackInfo[]>res.collection;
        } else if (type === PlatformType.Spotify) {
            const res = await this.spotifyApi.searchTracks(query, {
                limit
            });
            return res.body.tracks.items;
        }
    }

    addPlugin<A extends PluginName>(name: A, plugin: Plugin<A>) {
        this.plugins.set(name, plugin);
        if (this.configs.devOptions?.debug) {
            console.log(`#DEBUG:\n Class -> Manager \n Method -> addPlugin \n Message -> Added Plugin ${plugin.constructor.name} with name : ${name} `);
        }
    }
    leaveVc(guildId: string) {
        const player = this.players.get(guildId);
        player?._destroy();
        this.players.delete(guildId);
        return player.options.connection.destroy();
    }
}
