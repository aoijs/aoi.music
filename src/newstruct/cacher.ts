import { unlink, writeFile } from "fs/promises";
import { createReadStream, createWriteStream, existsSync, mkdirSync, PathLike, readdirSync, unlinkSync } from "fs";
import { join } from "path";
import { pipeline } from "stream/promises";
import { createGzip, createUnzip } from "zlib";
import { Readable } from "stream";
import { ReadableStream } from "stream/web";
import { Track } from "../typings/types";
import { PlatformType } from "../typings/enums";
import hidefile from "hidefile";
export class Cacher<T extends "memory" | "disk"> {
    #type: T;
    #map: Map<string, T extends "memory" ? Buffer | PathLike : PathLike> = new Map();
    #limit: number | null;
    #path: string | null;
    #prefixedPath: string;
    constructor({ type }: { type: T }) {
        this.#type = type;
        this.#path = "MUSIC_CACHE";
        this.#prefixedPath = ".MUSIC_CACHE";

        if (this.#type === "disk" && !existsSync(this.#path) && !existsSync(this.#prefixedPath)) {
            mkdirSync(this.#path, {
                recursive: true
            });
            hidefile.isHidden(this.#path, (err: Error | null, hidden: boolean) => {
                if (err === null) {
                    if (!hidden) {
                        this.#path = hidefile.hideSync(this.#path).toString();
                    }
                }
            });
        }
        if (this.#path !== this.#prefixedPath) {
            this.#path = this.#prefixedPath;
        }
        if (this.#type === "disk" && existsSync(this.#path)) {
            const files = readdirSync(this.#path);
            if (files.length > 0) {
                for (const file of files) {
                    unlinkSync(join(this.#path, file));
                }
            }
        }
    }
    async #doCompressionSave(stream: NodeJS.ReadableStream, hash: string) {
        const gzip = createGzip();
        await writeFile(hash, "");
        const file = createWriteStream(hash);
        await pipeline(stream, gzip, file);
    }
    async write(metaData: Track<"SoundCloud" | "Youtube" | "LocalFile" | "Spotify" | "Url">, stream: Readable) {
        if (this.has(metaData.id)) return;
        if (metaData.platformType === PlatformType.LocalFile) {
            this.#map.set(metaData.id, (<Track<"LocalFile">>metaData).url);
        } else if (this.type === "memory") {
            const data = [];
            if (stream instanceof ReadableStream) {
                stream = Readable.from(stream);
            }
            stream.on("data", (chunk) => {
                data.push(chunk);
            });
            stream.on("end", () => {
                //@ts-ignore
                this.#map.set(metaData.id, data);
            });
        } else if (this.#type === "disk") {
            const hash = join(this.#path, `${metaData.id.replaceAll("/", "").replaceAll(":", "").replaceAll(".", "")}.gz`);
            if (stream instanceof ReadableStream) {
                stream = Readable.from(stream);
            }
            await this.#doCompressionSave(stream, hash);
            this.#map.set(metaData.id, hash);
        }
    }
    get(id: string) {
        if (this.#type === "memory") {
            const a = this.#map.get(id);
            if (Array.isArray(a)) return Readable.from(a);
            else {
                return createReadStream(a);
            }
        } else {
            const hash = <string>this.#map.get(id);
            if (hash) {
                if (!hash.endsWith(".gz")) return createReadStream(hash);
                const file = createReadStream(hash);
                const unzip = createUnzip();
                const stream = file.pipe(unzip);
                return Readable.from(stream);
            }
        }
    }
    delete(id: string) {
        if (this.#type === "memory") {
            this.#map.delete(id);
        } else {
            const hash = this.#map.get(id);
            if (hash) {
                this.#map.delete(id);
                unlinkSync(hash);
            }
        }
    }
    clear() {
        if (this.#type === "disk") {
            const files = readdirSync(this.#path);
            for (const file of files) {
                unlink(join(this.#path, file));
            }
        }
        this.#map.clear();
    }
    has(id: string) {
        return this.#map.has(id);
    }
    get map() {
        return this.#map;
    }
    get type() {
        return this.#type;
    }
    get path() {
        return this.#path ?? null;
    }
}
