import { FFmpeg } from "prism-media";
import { FilterConfig } from "../typings/interfaces";
import { AudioPlayer } from "./audioPlayer";
export declare class Filter {
    #private;
    constructor(config: FilterConfig);
    add(options: {
        filter: string;
        value: string;
    }[], player: AudioPlayer): Promise<void>;
    remove(filter: string, player: AudioPlayer): Promise<void>;
    set(options: {
        filter: string;
        value: string;
    }[], player: AudioPlayer): Promise<void>;
    removeFirst(filter: string, player: AudioPlayer): Promise<void>;
    removeAll(player: AudioPlayer): Promise<void>;
    seek(time: number, player: AudioPlayer): Promise<boolean>;
    createFFmpeg(...args: string[]): FFmpeg;
    createFFmpegWithInputFile(input: string, ...args: string[]): FFmpeg;
}
