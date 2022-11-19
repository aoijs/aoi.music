import {
    DiscordGatewayAdapterCreator,
    entersState,
    joinVoiceChannel,
    VoiceConnectionStatus,
} from "@discordjs/voice";
import { Snowflake, VoiceChannel } from "discord.js";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { TypedEmitter } from "tiny-typed-emitter";
import InnerTube from "youtubei.js";
import IT from "youtubei.js/dist/src/Innertube";
import {
    AudioPLayerOptions,
    ManagerConfigurations,
    ManagerEvents,
} from "../typings/interfaces";
import { AudioPlayer } from "./audioPlayer";
import scdl from "soundcloud-downloader";
import { SCDL } from "soundcloud-downloader/src";
import sui, { Spotify } from "spotify-url-info";
import { fetch } from "undici";
import { PlatformType, PluginName } from "../typings/enums";
import Video from "youtubei.js/dist/src/parser/classes/Video";
import { TrackInfo } from "soundcloud-downloader/src/info";
import { Plugin } from "../typings/types";

export class Manager extends TypedEmitter<ManagerEvents> {
    configs: ManagerConfigurations;
    players: Map<Snowflake, AudioPlayer>;
    platforms: { youtube: Promise<IT>; spotify?: Spotify; soundcloud: SCDL };
    plugins: Map<PluginName, Plugin<PluginName>> = new Map<
        PluginName,
        Plugin<PluginName>
    >();
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
            youtube: InnerTube.create(),
            soundcloud: scdl,
            spotify: sui(fetch),
        };
        if (config.searchOptions.soundcloudClientId) {
            this.platforms.soundcloud.setClientID(
                config.searchOptions.soundcloudClientId,
            );
        }
        if (config.searchOptions?.youtubeAuth) {
            this.platforms.youtube.then((yt) => {
                const cred = JSON.parse(
                    readFileSync(config.searchOptions?.youtubeAuth).toString(),
                );
                yt.session.on("auth-pending", (data) => {
                    console.log({
                        url: data.verification_url,
                        code: data.user_code,
                    });
                    // data.verification_url contains the URL to visit to authenticate.
                    // data.user_code contains the code to enter on the website.
                });

                // 'auth' is fired once the authentication is complete
                yt.session.on("auth", ({ credentials }) => {
                    writeFileSync(
                        config.searchOptions.youtubeAuth,
                        JSON.stringify(credentials),
                    );
                    // do something with the credentials, eg; save them in a database.
                    console.log("Sign in successful");
                });

                // 'update-credentials' is fired when the access token expires, if you do not save the updated credentials any subsequent request will fail
                yt.session.on("update-credentials", ({ credentials }) => {
                    // do something with the updated credentials
                    writeFileSync(
                        config.searchOptions.youtubeAuth,
                        JSON.stringify(credentials),
                    );
                });
                yt.session.signIn(cred);
            });
        }
    }
    static defaultConfig(): ManagerConfigurations {
        return {
            devOptions: {
                debug: false,
            },
            searchOptions: {
                soundcloudClientId: undefined,
                youtubeCookie: undefined,
                youtubeAuth: undefined,
                youtubegl: "US",
                youtubeClient: "WEB",
            },
            requestOptions: {
                offsetTimeout: 500,
                soundcloudLikeTrackLimit: -1,
                youtubePlaylistLimit: -1,
                spotifyPlaylistLimit: -1,
            },
        };
    }

    #validateConfig(config: ManagerConfigurations) {
        if (
            config.requestOptions?.offsetTimeout &&
            (typeof config.requestOptions.offsetTimeout !== "number" ||
                config.requestOptions.offsetTimeout < 0)
        ) {
            throw new Error(
                `Invalid Time Provided in ManagerConfig#requestOptions['offsetTimeout']`,
            );
        } else if (
            config.requestOptions?.soundcloudLikeTrackLimit &&
            (typeof config.requestOptions.soundcloudLikeTrackLimit !==
                "number" ||
                config.requestOptions.soundcloudLikeTrackLimit < -1)
        ) {
            throw new Error(
                `Invalid Limit Provided in ManagerConfig#requestOptions['soundcloudLikeTrackLimit']`,
            );
        } else if (
            config.requestOptions?.youtubePlaylistLimit &&
            (typeof config.requestOptions.youtubePlaylistLimit !== "number" ||
                config.requestOptions.youtubePlaylistLimit < -1)
        ) {
            throw new Error(
                `Invalid Limit Provided in ManagerConfig#requestOptions['youtubePlaylistLimit']`,
            );
        } else if (
            config.requestOptions?.spotifyPlaylistLimit &&
            (typeof config.requestOptions.spotifyPlaylistLimit !== "number" ||
                config.requestOptions.spotifyPlaylistLimit < -1)
        ) {
            throw new Error(
                `Invalid Limit Provided in ManagerConfig#requestOptions['spotifyPlaylistLimit']`,
            );
        } else if (
            config.searchOptions?.youtubeAuth &&
            !existsSync(config.searchOptions.youtubeAuth)
        ) {
            throw new Error(
                `Invalid Auth Path Provided in ManagerConfig#searchOptions['youtubeAuth']`,
            );
        }
        else if(config.devOptions?.debug && typeof config.devOptions.debug !== "boolean") {
            throw new Error(`Invalid Debug Option Provided in ManagerConfig#devOptions['debug']`)
        }
        if(config.devOptions?.debug) {
            console.log( "Debug Mode Enabled" );
        }

    }

    async joinVc({
        type = "default",
        voiceChannel,
        selfDeaf = true,
        selfMute = false,
    }: {
        type: AudioPLayerOptions["type"];
        voiceChannel: VoiceChannel;
        selfDeaf?: boolean;
        selfMute?: boolean;
    }): Promise<boolean> {
        const data = {
            channelId: voiceChannel.id,
            guildId: voiceChannel.guildId,
            selfDeaf,
            selfMute,
            adapterCreator: <DiscordGatewayAdapterCreator>(
                (<unknown>voiceChannel.guild.voiceAdapterCreator)
            ),
            group: voiceChannel.client.user.id,
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
                    debug: this.configs.devOptions?.debug ?? false,
                }),
            );
            if (this.configs.devOptions?.debug) {
                console.log(
                    `#DEBUG:\n Class -> Manager \n Method -> joinVc \n Message -> Joined Voice Channel ${voiceChannel.name} in Guild ${voiceChannel.guild.name}`,
                );
            }
            return true;
        } catch (error) {
            connection.destroy();
            if (this.configs.devOptions?.debug) {
                console.log(
                    `#DEBUG:\n Class -> Manager \n Method -> joinVc \n Message -> Failed to join Voice Channel ${voiceChannel.name} in Guild ${voiceChannel.guild.name}`,
                );
            }
            return false;
        }
    }


    async search<T extends PlatformType>(type: T, query: string, limit = 1) {
        if (type === PlatformType.Youtube) {
            const yt = await this.platforms.youtube;
            const res = await yt.search(query, {
                type: "video",
            });
            return res.videos.as(Video).slice(0, limit);
        } else if (type === PlatformType.SoundCloud) {
            const sc = this.platforms.soundcloud;
            const res = await sc.search({
                query,
                limit,
                offset: 0,
                resourceType: "tracks",
            });
            return <TrackInfo[]>res.collection;
        }
    }
    addPlugin<A extends PluginName>(name: A, plugin: Plugin<A>) {
        this.plugins.set( name, plugin );
        if(this.configs.devOptions?.debug) {
            console.log(`#DEBUG:\n Class -> Manager \n Method -> addPlugin \n Message -> Added Plugin ${plugin.constructor.name} with name : ${name} `);
        }
    }
    leaveVc ( guildId: string )
    { 
        const player = this.players.get( guildId );
        player?._destroy();
        this.players.delete( guildId );
    }
}

