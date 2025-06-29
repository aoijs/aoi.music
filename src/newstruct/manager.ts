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
import { Innertube, UniversalCache, Log, YTNodes, YT } from "youtubei.js";
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
import { BG, buildURL, GOOG_API_KEY, USER_AGENT } from "bgutils-js";
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
      youtubeCookie: string;
      gl?: string;
      cookie?: string;
      debug?: boolean;
      potoken?: {
        token?: string;
        visitorData?: string;
      };
    } = {
      youtubeCookie: "",
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
      async function generateYoutubePoToken(): Promise<void> {
        const innertube = await Innertube.create({ retrieve_player: false });

        const userAgent = USER_AGENT;
        const requestKey = "O43z0dpjhgX20SCx4KAo";
        const visitorData = innertube.session.context.client.visitorData;

        const dom = new JSDOM(
          '<!DOCTYPE html><html lang="en"><head><title></title></head><body></body></html>',
          {
            url: "https://www.youtube.com/",
            referrer: "https://www.youtube.com/",
            userAgent,
          }
        );

        Object.assign(globalThis, {
          window: dom.window,
          document: dom.window.document,
          location: dom.window.location,
          origin: dom.window.origin,
        });

        if (!Reflect.has(globalThis, "navigator")) {
          Object.defineProperty(globalThis, "navigator", {
            value: dom.window.navigator,
          });
        }

        const challengeResponse = await innertube.getAttestationChallenge(
          "ENGAGEMENT_TYPE_UNBOUND"
        );

        if (!challengeResponse.bg_challenge)
          throw new Error("Could not get challenge");

        const interpreterUrl =
          challengeResponse.bg_challenge.interpreter_url
            .private_do_not_access_or_else_trusted_resource_url_wrapped_value;
        const bgScriptResponse = await fetch(`https:${interpreterUrl}`);
        const interpreterJavascript = await bgScriptResponse.text();

        if (interpreterJavascript) {
          new Function(interpreterJavascript)();
        } else throw new Error("Could not load VM");

        const botguard = await BG.BotGuardClient.create({
          program: challengeResponse.bg_challenge.program,
          globalName: challengeResponse.bg_challenge.global_name,
          globalObj: globalThis,
        });

        const webPoSignalOutput = [];
        const botguardResponse = await botguard.snapshot({ webPoSignalOutput });

        const integrityTokenResponse = await fetch(
          buildURL("GenerateIT", true),
          {
            method: "POST",
            headers: {
              "content-type": "application/json+protobuf",
              "x-goog-api-key": GOOG_API_KEY,
              "x-user-agent": "grpc-web-javascript/0.1",
              "user-agent": userAgent,
            },
            body: JSON.stringify([requestKey, botguardResponse]),
          }
        );

        const response = (await integrityTokenResponse.json()) as unknown[];

        if (typeof response[0] !== "string")
          throw new Error("Could not get integrity token");

        const integrityTokenBasedMinter = await BG.WebPoMinter.create(
          { integrityToken: response[0] },
          webPoSignalOutput
        );

        const videoId = "7eLARwNIjDY";

        const contentPoToken =
          await integrityTokenBasedMinter.mintAsWebsafeString(videoId);
        const sessionPoToken =
          await integrityTokenBasedMinter.mintAsWebsafeString(visitorData);

        const watchEndpoint = new YTNodes.NavigationEndpoint({
          watchEndpoint: { videoId },
        });

        const extraRequestArgs = {
          playbackContext: {
            contentPlaybackContext: {
              vis: 0,
              splay: false,
              lactMilliseconds: "-1",
              signatureTimestamp: innertube.session.player?.sts,
            },
          },
          serviceIntegrityDimensions: {
            poToken: contentPoToken,
          },
        };

        const watchResponse = await watchEndpoint.call(
          innertube.actions,
          extraRequestArgs
        );
        const videoInfo = new YT.VideoInfo(
          [watchResponse],
          innertube.actions,
          ""
        );

        const audioStreamingURL = `${videoInfo
          .chooseFormat({
            quality: "best",
            type: "video"
          })
          .decipher(innertube.session.player)}&pot=${sessionPoToken}`;

        if (config.devOptions?.debug) {
          console.debug("Visitor data:", decodeURIComponent(visitorData));
          console.debug("Content WebPO Token:", contentPoToken);
          console.debug("Session WebPO Token:", sessionPoToken);
          console.debug(
            "Cold Start WebPO Token:",
            BG.PoToken.generateColdStartToken(visitorData),
            "\n"
          );
          console.debug("Streaming URL:", audioStreamingURL);
        }
        ytoptions.potoken = { token: contentPoToken, visitorData };
      }

      generateYoutubePoToken();
    }
    // prevent future class changes from being logged to console
    // so people don't get confused about those *absolutely* irrelevant logs
    Log.setLevel(Log.Level.NONE);

    const youtubeOptions: any = {
      cache: new UniversalCache(true),
      generate_session_locally: true,
    };
    if (ytoptions.potoken?.token && ytoptions.potoken?.visitorData) {
      youtubeOptions.po_token = ytoptions.potoken.token;
      youtubeOptions.visitor_data = ytoptions.potoken.visitorData;
    }
    if (ytoptions.youtubeCookie) {
      youtubeOptions.cookie = ytoptions.youtubeCookie;
    }

    youtubeOptions.generate_session_locall = true;

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
    // Youtube nuked oAuth for non-tv clients
    if (config.searchOptions?.youtubeAuth === true) {
      this.platforms.youtube.then(async (yt) => {
        // should be inside of node_modules
        const authPath = join(__dirname, "./credentials.json");
        let authData = {};

        if (!existsSync(authPath)) {
          writeFileSync(authPath, "{}");
        }

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
          const current: Credentials = JSON.parse(
            readFileSync(authPath, "utf-8")
          );

          const { visitorData, poToken } = current;
          const newCredentials: Credentials = {
            visitorData,
            poToken,
            ...credentials,
          };

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
        youtubeToken: true,
        youtubegl: "US",
        // @ts-ignore
        youtubeClient: "YTMUSIC",
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
    // destory player if already exists to prevent memory leaks
    if (this.players.has(data.guildId)) {
      const player = this.players.get(data.guildId);
      player?._destroy();
      this.players.delete(data.guildId);
      player.options.connection.destroy();
    }
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
