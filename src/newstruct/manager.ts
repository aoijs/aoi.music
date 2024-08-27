import sui, { Spotify } from "spotify-url-info";
import SpotifyWebApi from "spotify-web-api-node";
import {
  DiscordGatewayAdapterCreator,
  entersState,
  joinVoiceChannel,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import { Snowflake, VoiceBasedChannel } from "discord.js";
import { TypedEmitter } from "tiny-typed-emitter/lib/index";
import { Innertube, UniversalCache, Proto, Utils } from "youtubei.js";
import IT from "youtubei.js";
import {
  Credentials,
  AudioPLayerOptions,
  ManagerConfigurations,
  ManagerEvents,
} from "../typings/interfaces";
import { AudioPlayer } from "./audioPlayer";
import scdl from "soundcloud-downloader";
import { SCDL } from "soundcloud-downloader/src";
import { fetch } from "undici";
import { PlatformType, PluginName } from "../typings/enums";
import { TrackInfo } from "soundcloud-downloader/src/info";
import { Plugin } from "../typings/types";
import { JSDOM } from "jsdom";
import { BG } from "bgutils-js";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

export class Manager extends TypedEmitter<ManagerEvents> {
  configs: ManagerConfigurations;
  players: Map<Snowflake, AudioPlayer>;
  platforms: { youtube: Promise<IT>; spotify?: Spotify; soundcloud: SCDL };
  plugins: Map<PluginName, Plugin<PluginName>> = new Map<
    PluginName,
    Plugin<PluginName>
  >();
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
      potoken?: {
        token?: string;
        visitorData?: string;
      };
    } = {};
    if (config.searchOptions?.youtubeCookie) {
      ytoptions.cookie = config.searchOptions?.youtubeCookie;
    }
    if (config.searchOptions?.youtubegl) {
      ytoptions.cookie = config.searchOptions?.youtubegl ?? "US";
    }
    if (config.searchOptions?.youtubeToken) {
      const requestKey = "O43z0dpjhgX20SCx4KAo";

      /*
       * This function generates a YouTube PoToken using BotGuard.
       * https://github.com/LuanRT/BgUtils/blob/main/examples/node/main.mjs
       *
       */
      async function generateYoutubePoToken(): Promise<void> {
        const visitorData = Proto.encodeVisitorData(
          Utils.generateRandomString(11),
          Math.floor(Date.now() / 1000)
        );

        const dom = new JSDOM();

        globalThis.window = dom.window;
        globalThis.document = dom.window.document;

        const bgConfig = {
          fetch: (url, options) => fetch(url, options),
          globalObj: globalThis,
          identity: visitorData,
          requestKey,
        };

        // @ts-expect-error
        return BG.Challenge.create(bgConfig)
          .then((challenge) => {
            if (!challenge)
              throw new Error(
                "[@aoijs/aoi.music]: Could not get challenge, remove the youtubeToken option if this error persists"
              );

            if (challenge.script) {
              const script = challenge.script.find((sc) => sc !== null);
              if (script) new Function(script)();
            } else {
              console.warn("[@aoijs/aoi.music]: Failed to load BotGuard.");
            }

            return BG.PoToken.generate({
              program: challenge.challenge,
              globalName: challenge.globalName,
              // @ts-ignore
              bgConfig,
            });
          })
          .then((poToken) => {
            const authPath = join(__dirname, "./credentials.json");
            if (!existsSync(authPath)) {
              writeFileSync(authPath, "{}");
            }
            const credentials = JSON.parse(readFileSync(authPath, "utf-8"));
            credentials.poToken = poToken;
            credentials.visitorData = visitorData;
            writeFileSync(authPath, JSON.stringify(credentials));
            if (config.devOptions?.debug) {
              console.log("#DEBUG PoToken:", poToken);
              console.log("#DEBUG VisitorData:", visitorData);
            }
            ytoptions.potoken = { token: poToken, visitorData };
          })
          .catch((error) => {
            console.error(
              "[@aoijs/aoi.music]: Failed to generate YouTube PoToken:",
              error
            );
          });
      }

      generateYoutubePoToken();
    }
    const youtubeOptions: any = {
      cache: new UniversalCache(true),
    };
    if (ytoptions.potoken?.token && ytoptions.potoken?.visitorData) {
      youtubeOptions.po_token = ytoptions.potoken.token;
      youtubeOptions.visitor_data = ytoptions.potoken.visitorData;
    }
    this.platforms = {
      youtube: Innertube.create(youtubeOptions),
      soundcloud: scdl,
      spotify: sui(fetch),
    };
    if (
      config.searchOptions?.spotifyAuth?.clientId &&
      config.searchOptions?.spotifyAuth?.clientSecret
    ) {
      this.spotifyApi = new SpotifyWebApi({
        clientId: config.searchOptions?.spotifyAuth?.clientId,
        clientSecret: config.searchOptions?.spotifyAuth?.clientSecret,
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
      this.platforms.soundcloud.setClientID(
        config.searchOptions.soundcloudClientId
      );
    }
    if (config.searchOptions?.youtubeAuth === true) {
      this.platforms.youtube.then(async (yt) => {
        // should be inside of node_modules
        const authPath = join(__dirname, "./credentials.json");
        let authData = {};

        if (existsSync(authPath)) {
          const fileContent = readFileSync(authPath, "utf8");
          authData = JSON.parse(fileContent);
        }

        yt.session.on("auth-pending", (data) => {
          console.log(
            `[@aoijs/aoi.music]: Sign in pending: visit ${data.verification_url} and enter ${data.user_code} to sign in.`
          );
        });

        const updateCredentials = (credentials: Partial<Credentials>) => {
          const current: Credentials = JSON.parse(readFileSync(authPath, "utf-8"));
        
          const { visitorData, poToken } = current;
          const newCredentials: Credentials = { visitorData, poToken, ...credentials };
        
          writeFileSync(authPath, JSON.stringify(newCredentials));
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
        if (
          existsSync(authPath) &&
          JSON.parse(readFileSync(authPath, "utf-8")).access_token
        ) {
          try {
            const credentials = JSON.parse(readFileSync(authPath, "utf-8"));
            // remove unneeded data
            delete credentials.visitorData;
            delete credentials.poToken;
            console.log(
              "[@aoijs/aoi.music]: Attempting to sign in with cached credentials."
            );
            await yt.session.signIn(credentials);
          } catch {
            console.warn(
              "[@aoijs/aoi.music]: Failed to sign in with cached credentials, please reauthenticate."
            );
            const { visitorData, poToken } = JSON.parse(
              readFileSync(authPath, "utf-8")
            );
            writeFileSync(
              authPath,
              JSON.stringify({ visitorData, poToken }, null, 2)
            );
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
        debug: false,
      },
      searchOptions: {
        soundcloudClientId: undefined,
        youtubeCookie: undefined,
        youtubeAuth: true,
        youtubegl: "US",
        youtubeClient: "TV_EMBEDDED",
        spotifyAuth: {
          clientId: undefined,
          clientSecret: undefined,
        },
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
        `Invalid Time Provided in ManagerConfig#requestOptions['offsetTimeout']`
      );
    } else if (
      config.requestOptions?.soundcloudLikeTrackLimit &&
      (typeof config.requestOptions.soundcloudLikeTrackLimit !== "number" ||
        config.requestOptions.soundcloudLikeTrackLimit < -1)
    ) {
      throw new Error(
        `Invalid Limit Provided in ManagerConfig#requestOptions['soundcloudLikeTrackLimit']`
      );
    } else if (
      config.requestOptions?.youtubePlaylistLimit &&
      (typeof config.requestOptions.youtubePlaylistLimit !== "number" ||
        config.requestOptions.youtubePlaylistLimit < -1)
    ) {
      throw new Error(
        `Invalid Limit Provided in ManagerConfig#requestOptions['youtubePlaylistLimit']`
      );
    } else if (
      config.requestOptions?.spotifyPlaylistLimit &&
      (typeof config.requestOptions.spotifyPlaylistLimit !== "number" ||
        config.requestOptions.spotifyPlaylistLimit < -1)
    ) {
      throw new Error(
        `Invalid Limit Provided in ManagerConfig#requestOptions['spotifyPlaylistLimit']`
      );
    } else if (
      config.devOptions?.debug &&
      typeof config.devOptions.debug !== "boolean"
    ) {
      throw new Error(
        `Invalid Debug Option Provided in ManagerConfig#devOptions['debug']`
      );
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
    adapter,
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
        })
      );
      if (this.configs.devOptions?.debug) {
        console.log(
          `#DEBUG:\n Class -> Manager \n Method -> joinVc \n Message -> Joined Voice Channel ${voiceChannel.name} in Guild ${voiceChannel.guild.name}`
        );
      }
      return true;
    } catch (error) {
      connection.destroy();
      if (this.configs.devOptions?.debug) {
        console.log(
          `#DEBUG:\n Class -> Manager \n Method -> joinVc \n Message -> Failed to join Voice Channel ${voiceChannel.name} in Guild ${voiceChannel.guild.name}`
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
      return res.videos.slice(0, limit);
    } else if (type === PlatformType.SoundCloud) {
      const sc = this.platforms.soundcloud;
      const res = await sc.search({
        query,
        limit,
        offset: 0,
        resourceType: "tracks",
      });
      return <TrackInfo[]>res.collection;
    } else if (type === PlatformType.Spotify) {
      const res = await this.spotifyApi.searchTracks(query, {
        limit,
      });
      return res.body.tracks.items;
    }
  }

  addPlugin<A extends PluginName>(name: A, plugin: Plugin<A>) {
    this.plugins.set(name, plugin);
    if (this.configs.devOptions?.debug) {
      console.log(
        `#DEBUG:\n Class -> Manager \n Method -> addPlugin \n Message -> Added Plugin ${plugin.constructor.name} with name : ${name} `
      );
    }
  }
  leaveVc(guildId: string) {
    const player = this.players.get(guildId);
    player?._destroy();
    this.players.delete(guildId);
    return player.options.connection.destroy();
  }
}
