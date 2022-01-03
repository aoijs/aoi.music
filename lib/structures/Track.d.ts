import { GuildMember } from "discord.js";
import { SourceProviders } from "../utils/constants";
import { TrackInfoType, TrackRawInfo } from "../utils/typings";
export default class Track {
    requestUser: GuildMember;
    info: TrackInfoType;
    rawInfo: TrackRawInfo;
    source: SourceProviders;
    type: number;
    constructor(data: {
        requestUser: GuildMember;
        rawinfo: TrackRawInfo;
        type: number;
    });
    /**
     * @method link
     * @readonly
     * @returns {string}
     */
    get link(): string;
    /**
     * @method transformInfo
     * @param {TrackRawInfo} rawInfo rawinfo of the track
     * @returns {void}
     */
    transformInfo(rawInfo: TrackRawInfo): Promise<void>;
}
