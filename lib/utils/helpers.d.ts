import { Track } from "../structures";
import { PossibleStream } from "./typings";
export declare function shuffle(array: Array<Track>): Track[];
export declare function getDurationOfRawStream(stream: PossibleStream, filters: object): void;
