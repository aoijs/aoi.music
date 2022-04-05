import { GuildMember } from "discord.js";
import { getChannel, YoutubeChannel } from "youtube-scrapper";
import { SourceProviders } from "../utils/constants";
import { TrackInfoType, TrackRawInfo } from "../utils/typings";
import Player from "./Player";

export default class Track {
  public requestUser: GuildMember;
  public info: TrackInfoType;
  public rawInfo: TrackRawInfo;
  public source: SourceProviders;
  public type: number;

  public player: Player;
  constructor(
    data: {
      requestUser: GuildMember;
      rawinfo: TrackRawInfo;
      type: number;
    },
    player: Player,
  ) {
    this.requestUser = data.requestUser;
    this.type = data.type;
    this.rawInfo = data.rawinfo;
    this.source = data.type;
    this.transformInfo(data.rawinfo);
    this.player = player;
  }
  /**
   * @method link
   * @readonly
   * @returns {string}
   */
  public get link(): string {
    return this.info.url || this.info.path;
  }
  /**
   * @method transformInfo
   * @param {TrackRawInfo} rawInfo rawinfo of the track
   * @returns {void}
   */
  public async transformInfo(rawInfo: TrackRawInfo): Promise<void> {
    if (this.type === 0) {
      this.info = {
        title: rawInfo.title,
        description: rawInfo.description,
        url: rawInfo.permalink_url,
        thumbnail: rawInfo.artwork_url?.replace("-large.jpg", "-t500x500.jpg"),
        raw_duration: rawInfo.duration,
        duration: rawInfo.full_duration,
        identifier: "SoundCloud",
        author: rawInfo.user?.username,
        authorURL: rawInfo.user?.permalink_url,
        authorAvatar: rawInfo.user.avatar_url,
        likes: rawInfo.likes_count,
        views: rawInfo.playback_count,
        createdTimestamp: rawInfo.created_at
          ? new Date(rawInfo.created_at).getTime()
          : null,
      };
    } else if (this.type === 1) {
      this.info = {
        title: rawInfo.title,
        description: "A Local File",
        path: rawInfo.path,
        dir: rawInfo.dir,
        duration: rawInfo.duration * 1000,
        identifier: "LocalFile",
        createdTimestamp: rawInfo.createdTimestamp,
        likes: 0,
        views: 0,
      };
    } else if (this.type === 2) {
      this.info = {
        title: rawInfo.title,
        description: "An Attachment or URL",
        url: rawInfo.url,
        duration: rawInfo.duration * 1000,
        identifier: "Url",
        likes: 0,
        views: 0,
      };
    } else if (this.type === 3) {
      rawInfo = rawInfo.details ? rawInfo.details : rawInfo;

      let channelData: YoutubeChannel;

      if (this.player?.manager?.config?.youtube?.fetchAuthor) {
        channelData = await getChannel(rawInfo.channelId);
      }

      this.info = {
        title: rawInfo.title,
        description: rawInfo.shortDescription ?? rawInfo.description,
        url: rawInfo.url,
        thumbnail:
          rawInfo.thumbnails?.[(rawInfo?.thumbnails?.length || 1) - 1]?.url,
        raw_duration: rawInfo.duration,
        duration: rawInfo.duration,
        identifier: "Youtube",
        author: rawInfo.author,
        authorAvatar: channelData?.details.avatars?.[0]?.url,
        authorURL: channelData?.url,
        likes: null,
        views: rawInfo.viewCount,
      };
    } else {
      this.info = {
        title: rawInfo.title,
        description: rawInfo.description,
        url: rawInfo.permalink_url || rawInfo.url || rawInfo.path,
        createdTimestamp: rawInfo.createdTimestamp,
      };
    }
  }
}
