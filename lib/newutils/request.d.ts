import { Manager } from "./../newstruct/manager";
import { PlatformType } from "./../typings/enums";
import { Track } from "../typings/types";
export declare function generateInfo<T extends "LocalFile" | "Url">(id: string, type: T): Promise<Track<T>>;
export declare function requestInfo<T extends keyof typeof PlatformType>(id: string, type: T, manager: Manager): Promise<Track<T>>;
export declare function requestStream<T extends keyof typeof PlatformType>(track: Track<T>, type: T, manager: Manager): Promise<any>;
