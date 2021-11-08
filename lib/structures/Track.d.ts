import { GuildMember } from "discord.js";
import { SourceProviders } from "../utils/constants";
import { TrackInfoType, TrackRawInfo } from "../utils/typings";
export default class Track {
    requestUser: GuildMember;
    info: TrackInfoType;
    rawInfo: TrackRawInfo;
    source: SourceProviders;
    constructor(data: {
        requestUser: GuildMember;
        rawinfo: TrackRawInfo;
        type: number;
    });
    /**
     * getType
     */
    getType(type: number): number;
    /**
     * transformInfo
     */
    transformInfo(rawInfo: TrackRawInfo): TrackInfoType;
}
