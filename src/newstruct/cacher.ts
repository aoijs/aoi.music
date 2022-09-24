import { writeFile } from "fs/promises";
import { createReadStream, createWriteStream, existsSync, mkdirSync, unlinkSync } from "fs";
import { join } from "path";
import { pipeline } from "stream/promises";
import { createGzip, createUnzip } from "zlib";
import { CacheConfig } from "../typings/interfaces";
import { Readable } from "stream";
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
    write(metaData: any, stream: NodeJS.ReadStream) {
        let data = "";
        stream.on("data", (chunk) => {
            data += chunk;
        });
        stream.on("end", async () => {
            if (this.#config.type === "memory") {
                this.#config.map.set(metaData.id, Buffer.from(data));
            } else {
                const hash = join(
                    this.#config.path,
                    `${Math.floor(10000000 * Math.random())}.gz`,
                );
                await this.#doCompressionSave(stream, hash);
                this.#config.map.set(metaData.id, hash);
            }
        });
    }
    get(id: string) {
        if (this.#config.type === "memory") {
            return Readable.from(this.#config.map.get(id));
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
    delete ( id: string )
    { 
        if ( this.#config.type === "memory" )
        { 
            this.#config.map.delete( id );
        } else
        {
            const hash = this.#config.map.get( id );
            if ( hash )
            {
                this.#config.map.delete( id );
                unlinkSync( hash );
            }
        }
    }
    has ( id: string )
    {
        return this.#config.map.has( id );
    }
}
