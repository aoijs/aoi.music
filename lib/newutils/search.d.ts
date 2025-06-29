import { Manager } from "../newstruct/manager";
import { PlatformType } from "../typings/enums";
export declare function search(query: string, type: PlatformType, manager: Manager): Promise<string[]>;
