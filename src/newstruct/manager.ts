import { DiscordGatewayAdapterCreator, entersState, joinVoiceChannel, VoiceConnectionStatus } from "@discordjs/voice";
import { Snowflake, VoiceChannel } from "discord.js";
import { existsSync, readFileSync } from "fs";
import { TypedEmitter } from "tiny-typed-emitter";
import InnerTube from "youtubei.js";
import IT from "youtubei.js/dist/src/Innertube";
import { AudioPLayerOptions, ManagerConfigurations, ManagerEvents } from "../typings/interfaces";
import { AudioPlayer } from "./audioPlayer";
import scdl from "soundcloud-downloader";
import { SCDL } from "soundcloud-downloader/src";
import  sui, { Spotify } from "spotify-url-info"
import { fetch } from "undici";

export class Manager extends TypedEmitter<ManagerEvents>
{
    configs: ManagerConfigurations;
    players: Map<Snowflake, AudioPlayer>;
    platforms: { youtube: Promise<IT>; spotify?: Spotify; soundcloud: SCDL };
    constructor ( config?: ManagerConfigurations )
    {
        super();
        this.#validateConfig( config );
        this.configs = config ?? Manager.defaultConfig();
        this.players = new Map();
        const ytoptions: {
            gl?: string;
            cookie?: string;
            debug?: boolean;
        } = {};
        if ( config.searchOptions?.youtubeCookie )
        {
            ytoptions.cookie = config.searchOptions?.youtubeCookie;
        }
        if ( config.searchOptions?.youtubegl )
        {
            ytoptions.cookie = config.searchOptions?.youtubegl ?? 'US';
        }
        this.platforms = {
            youtube:  InnerTube.create(),
            soundcloud: scdl,
            spotify: sui( fetch ),
        };
        if ( config.searchOptions.soundcloudClientId )
        {
            this.platforms.soundcloud.setClientID( config.searchOptions.soundcloudClientId );
        }
        if ( config.searchOptions?.youtubeAuth )
        {
            const cred = JSON.parse( readFileSync( config.searchOptions?.youtubeAuth ).toString() );
            this.platforms.youtube.then( d => d.session.signIn( cred ) );
        }
    }
    static defaultConfig (): ManagerConfigurations
    {
        return {
            devOptions:
            {
                debug: false,
            },
            searchOptions:
            {
                soundcloudClientId: undefined,
                youtubeCookie: undefined,
                youtubeAuth: undefined,
                youtubegl: 'US',
                youtubeClient: "WEB"
            },
            requestOptions:
            {
                offsetTimeout: 500,
                soundcloudLikeTrackLimit: -1,
                youtubePlaylistLimit: -1,
                spotifyPlaylistLimit: -1,
            },
        };
    }

    #validateConfig ( config: ManagerConfigurations )
    {
        if ( config.requestOptions?.offsetTimeout && ( typeof config.requestOptions.offsetTimeout !== "number" || config.requestOptions.offsetTimeout < 0 ) )
        {
            throw new Error( `Invalid Time Provided in ManagerConfig#requestOptions['offsetTimeout']` );
        }
        else if ( config.requestOptions?.soundcloudLikeTrackLimit && (
            typeof config.requestOptions.soundcloudLikeTrackLimit !== "number" ||
            config.requestOptions.soundcloudLikeTrackLimit < -1
        ) )
        {
            throw new Error( `Invalid Limit Provided in ManagerConfig#requestOptions['soundcloudLikeTrackLimit']` );
        }
        else if ( config.requestOptions?.youtubePlaylistLimit && (
            typeof config.requestOptions.youtubePlaylistLimit !== "number" ||
            config.requestOptions.youtubePlaylistLimit < -1
        ) )
        {
            throw new Error( `Invalid Limit Provided in ManagerConfig#requestOptions['youtubePlaylistLimit']` );
        }
        else if ( config.requestOptions?.spotifyPlaylistLimit && (
            typeof config.requestOptions.spotifyPlaylistLimit !== "number" ||
            config.requestOptions.spotifyPlaylistLimit < -1
        ) )
        {
            throw new Error( `Invalid Limit Provided in ManagerConfig#requestOptions['spotifyPlaylistLimit']` );
        }
        else if ( config.searchOptions?.youtubeAuth && !existsSync( config.searchOptions.youtubeAuth ) )
        {
            throw new Error( `Invalid Auth Path Provided in ManagerConfig#searchOptions['youtubeAuth']` );
        }
    }

    async joinVc ( {
        type = "default",
        voiceChannel,
        selfDeaf = true,
        selfMute = false,
    }: {
        type: AudioPLayerOptions[ 'type' ];
        voiceChannel: VoiceChannel;
        selfDeaf?: boolean;
        selfMute?: boolean;
    } ): Promise<void>
    {
        const data = {
            channelId: voiceChannel.id,
            guildId: voiceChannel.guildId,
            selfDeaf,
            selfMute,
            adapterCreator: <DiscordGatewayAdapterCreator> <unknown> voiceChannel.guild.voiceAdapterCreator,
            group: voiceChannel.client.user.id,
        };
        const connection = joinVoiceChannel( data );
        connection.on( "error", console.error );
        try
        {
            await entersState( connection, VoiceConnectionStatus.Ready, 30000 );
            this.players.set(
                voiceChannel.guildId,
                new AudioPlayer( {
                    type,
                    connection,
                    voiceChannel: voiceChannel.id,
                    manager: this,
                    debug: this.configs.devOptions?.debug ?? false,
                } ),
            );
        } catch ( error )
        {
            connection.destroy();
            throw error;
        }
        if ( this.configs.devOptions?.debug )
        {
            connection.on( "debug", console.log );
        }
    }
}
