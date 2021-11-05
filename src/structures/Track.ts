import { GuildMember } from "discord.js";
import { SourceProviders } from "../utils/constants";
import { TrackInfoType, TrackRawInfo } from "../utils/typings";

export default class Track {
    public requestUser : GuildMember;
    public info : TrackInfoType;
    public rawInfo : TrackRawInfo;
    public source: SourceProviders;
    constructor(data :{requestUser : GuildMember,rawinfo : TrackRawInfo,type : number}) {
        this.requestUser = data.requestUser;
        this.info = this.transformInfo(data.rawinfo);
        this.rawInfo = data.rawinfo;
        //this.source = this.getType(data.type);
    }
    /**
     * getType
     */

    /*
    Soundcloud,
    Twitch,
    LocalFile,
    Attachment
    */
    public getType(type : number) {
        return type === 0 ? 'Soundcloud' : type === 1 ? 'LocalFile' : type === 2 ? 'Attachment' : 'None'
    }
    /**
     * transformInfo
     */
    public transformInfo(rawInfo : TrackRawInfo) : TrackInfoType {
        //if(this.source === 'sou')
        return {
        title : rawInfo.title,
        description : rawInfo.description,
        url : rawInfo.permalink_url
        }
    }
}