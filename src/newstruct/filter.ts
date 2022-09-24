import {
    AudioResource,
    createAudioResource,
    StreamType,
} from "@discordjs/voice";
import getAudioDurationInSeconds from "get-audio-duration";
import { FFmpeg } from "prism-media";
import { Readable } from "stream";
import { ReadableStream } from "stream/web";
import { FFMPEG_ARGS } from "../newutils/constants";
import { requestStream } from "../newutils/request";
import { FilterConfig } from "../typings/interfaces";
import { AudioPlayer } from "./audioPlayer";

export class Filter {
    #config: FilterConfig;
    constructor(config: FilterConfig) {
        this.#config = config;
    }
    async add(
        options: { filter: string; value: string }[],
        player: AudioPlayer,
    ) {
        const f = player.filters;
        for ( const option of options )
        {
            const { filter, value } = option;
            f.push( `${ filter }=${ value }` );
        }
            player.updateFilters( f );
        await this.#apply(player);
    }
    async remove(filter: string, player: AudioPlayer) {
        const f = player.filters.filter( ( f ) => !f.startsWith( filter ) );
        player.updateFilters(f);
        await this.#apply(player);
    }
    async removeFirst(filter: string, player: AudioPlayer) {
        const index = player.filters.findIndex( ( f ) => f.startsWith( filter ) );
        if ( index !== -1 )
        {
            const f = player.filters;
            f.splice( index, 1 );
            player.updateFilters(f);
            await this.#apply(player);
        }
    }
    async removeAll(player: AudioPlayer) {
        player.updateFilters([]);
        await this.#apply(player);
    }
    async #apply(player: AudioPlayer) {
        const track = player.currentTrack;
        player.player.pause();
        //@ts-ignore
        const r: AudioResource<unknown> = player.player.state.resource;
        if (!track) return;
        const stream = await requestStream(
            track,
            track.formatedPlatforms,
            player.options.manager,
        );
        const ffmpeg = new FFmpeg( {
            //@ts-ignore
            args: player.filters.length ? this.#config.filterFromStart ? [...FFMPEG_ARGS, ...player.filters] : ["-ss",`${player.player.state.resource.playbackDuration}ms`,...FFMPEG_ARGS, "-af", player.filters.join(",")] : [...FFMPEG_ARGS],
        });
        let str:  Readable | FFmpeg;
        if ( stream instanceof ReadableStream )
        {
            str = <FFmpeg>Readable.from( stream ).pipe( ffmpeg );
        }
        else str = stream.pipe( ffmpeg );

        const newResource = createAudioResource(str, {
            inlineVolume: true,
            inputType: StreamType.Raw,
        });
        player.player.play(newResource);
    }
    createFFmpeg(...args:string[]) {
        const ffmpeg = new FFmpeg({
            args: [...FFMPEG_ARGS,...args],
        });
        return ffmpeg;
    }
}
