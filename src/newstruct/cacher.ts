import { writeFile } from "fs/promises";
import {
    createReadStream,
    createWriteStream,
    existsSync,
    mkdirSync,
    PathLike,
    unlinkSync,
} from "fs";
import { join } from "path";
import { pipeline } from "stream/promises";
import { createGzip, createUnzip } from "zlib";
import { CacheConfig } from "../typings/interfaces";
import { Readable } from "stream";
import { ReadableStream } from "stream/web";
import { Track } from "../typings/types";
import { PlatformType } from "../typings/enums";
export class Cacher<T extends "memory" | "disk"> {
    #config: CacheConfig<T>;
    constructor(config: CacheConfig<T>) {
        this.#config = config;
        if (config.type === "disk" && !existsSync(config.path)) {
            mkdirSync(config.path, {
                recursive: true,
            });
        }
        this.#config.map = new Map();
    }
    async #doCompressionSave(stream: NodeJS.ReadableStream, hash: string) {
        const gzip = createGzip();
        await writeFile(hash, "");
        const file = createWriteStream(hash);
        await pipeline(stream, gzip, file);
    }
    async write ( metaData: Track<'SoundCloud' | 'Youtube' | 'LocalFile' | 'Spotify' | 'Url'>, stream: Readable )
    {
        if(this.has(metaData.id)) return;
        if ( metaData.platformType === PlatformType.LocalFile )
        {
            this.#config.map.set( metaData.id, (<Track<'LocalFile'>>metaData).url );
        }
        else if ( this.type === "memory" )
        {
            const data = [];
            stream.on( 'data', ( chunk ) =>
            { 
                data.push( chunk );
            } )
            stream.on( 'end', () =>
            { 
                //@ts-ignore
                this.#config.map.set( metaData.id, Readable.from( data ) );
            } );
        } else if ( this.#config.type === "disk" )
        {
            const hash = join((<CacheConfig<'disk'>>this.#config).path, `${metaData.id}.gz`);
            await this.#doCompressionSave(stream, hash);
            this.#config.map.set(metaData.id, hash);
        }
    }
    get(id: string) {
        if (this.#config.type === "memory") {
            const a = this.#config.map.get( id );
            if ( a instanceof Readable ) return a;
            else
            {
                return createReadStream( a );
            }
        } else {
            const hash = this.#config.map.get(id);
            if (hash) {
                const file = createReadStream(hash);
                const unzip = createUnzip();
                const stream = file.pipe(unzip);
                return Readable.from(stream);
            }
        }
    }
    delete(id: string) {
        if (this.#config.type === "memory") {
            this.#config.map.delete(id);
        } else {
            const hash = this.#config.map.get(id);
            if (hash) {
                this.#config.map.delete(id);
                unlinkSync(hash);
            }
        }
    }
    has(id: string) {
        return this.#config.map.has(id);
    }
    get map ()
    {
        return this.#config.map;
    }
    get type ()
    {
        return this.#config.type;
    }
    get path (): PathLike | null
    {
        //@ts-ignore
        return this.#config.path ?? null;
    }
}
