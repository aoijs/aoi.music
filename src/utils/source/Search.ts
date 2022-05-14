import scdl from "soundcloud-downloader";
import fs from "fs";
import path from "path";
import axios from "axios";
import { getAudioDurationInSeconds } from "get-audio-duration";
import fetch from "node-fetch";
import spotify from "spotify-url-info";
const { getTracks } = spotify(fetch);
import {
  AttachmentInfoType,
  AttachmentStreamType,
  LocalInfoType,
  LocalStreamType,
  SoundcloudOptions,
  YoutubeMixPlaylistData,
  YoutubeRelatedData,
} from "../typings";

import * as yts from "youtube-scrapper";
import {
  YoutubeMix,
  YoutubeRelated,
  ytMixHTMLParser,
  ytRelatedHTMLParser,
} from "../helpers";
import { start } from "repl";
export class SoundCloud {
  public options?: SoundcloudOptions = { clientId: undefined };
  constructor(config?: SoundcloudOptions) {
    this.options = config;
    if (config?.clientId) {
      this.setClientId(config.clientId);
    }
  }
  /**
   * @method setClientId
   * @description sets the clientId
   * @param {string} clientId clientId to be set
   */
  public setClientId(clientId: string): void {
    this.options.clientId = clientId;
    scdl.saveClientID = true;
    scdl.setClientID(clientId);
  }

  /**
   * @method baseURLRegex
   * @description returns the regex for baseUrl
   * @readonly
   */
  public get baseURLRegex(): RegExp {
    return /^(http(s):\/\/)(m.)soundcloud.com/;
  }
  /**
   * @method baseURL
   * @description returns the supported base urls for soundcloud
   * @readonly
   */
  public get baseURL(): string[] {
    return ["https://soundcloud.com", "https://m.soundcloud.com"];
  }
  /**
   * @method parseURL
   * @description parses the souncloud urls to supported format
   * @param {string} query query that needs to be parsed
   */
  public parseURL(query: string): string {
    const regex = this.baseURLRegex;
    return query.replace(regex, this.baseURL[0]);
  }
  /**
   * @method search
   * @description searchs for the query
   * @param {string} query query required for search
   * @param {SoundcloudOptions} scOptions options for soundcloud-downloader
   */
  public async search({
    query,
    limit = 1,
  }: {
    query: string;
    scOptions?: SoundcloudOptions;
    limit?: number;
  }): Promise<any[]> {
    if (this.baseURL.some((x) => query.startsWith(x))) {
      query = this.parseURL(query);

      if (query.split("/")[4] === "sets") {
        const set = await scdl.getSetInfo(query).catch((_) => {
          return {
            tracks: [],
          };
        }); //SCDL.getSetInfo(url: string): Promise<SetInfo>

        return set.tracks.map(
          (x: { permalink_url?: string }) => x.permalink_url,
        );
      } else if (query.endsWith("likes") && query.split("/").length === 5) {
        const arr = query.split("/");
        arr.pop();

        const likeUrl = arr.join("/");

        const { collection } = await scdl
          .getLikes({
            profileUrl: likeUrl,
            limit: this.options.likeTrackLimit ?? 200,
          })
          .catch((e) => {
            return {
              collection: [],
            };
          });
        return collection.map(x => x.track)
      } else {
        return [query]; // hardest line
      }
    } else {
      const { collection } = await scdl
        .search({ limit, query, resourceType: "tracks" })
        .catch((e) => {
          console.error(e);
          return {
            collection: [],
          };
        });

      if (!collection.length) return [];
      // fixed e
      return collection;
    }
  }
  /**
   * @method getInfo
   * @description gets the Data of the Url Provided
   * @param {string} url url of the track
   */
  public async getInfo(url: string): Promise<any> {
    const info = await scdl.getInfo(url).catch(console.error);
    if (!info) return;

    return info;
  }
  /**
   * @method getStream
   * @description gets the stream data of the url provided
   * @param {string} url url of the track
   */
  public async getStream(url: string): Promise<any> {
    const stream = await scdl.download(url).catch((_) => null);
    if (!stream) return;

    return stream;
  }
  public async related(id: number, limit = 1) {
    const { collection: data } = await scdl.related(id, limit);
    return data;
  }
}

export class LocalFile {
  /**
   * @method search
   * @description searchs for the file , if it exists, returns the path;
   * @param {string} query path to be searched
   */
  public async search(query: string): Promise<string[]> {
    if (!fs.existsSync(query)) return;

    return [query];
  }
  /**
   * @method getInfo
   * @description gets info of the path
   * @param {string} query path
   */
  public async getInfo(query: string): Promise<LocalInfoType> {
    return {
      title: path.basename(query),
      description: "A Local File",
      path: query,
      dir: path.dirname(query),
      duration: await getAudioDurationInSeconds(query),
      createdTimestamp: fs.statSync(query).birthtimeMs,
    };
  }
  /**
   * @method getStream
   * @description gets the stream data of provided file
   * @param {string} query path of the file
   */
  public async getStream(query: string): LocalStreamType {
    let stream: void | fs.ReadStream | PromiseLike<void | fs.ReadStream>;
    try {
      stream = fs.createReadStream(query);
    } catch (e) {
      throw new Error(e);
    }

    return stream;
  }
}

export class Attachments {
  /**
   * @method search
   * @description searchs for the url , if it exists, returns the url;
   * @param {string} query url to be searched
   */
  public async search(query: string): Promise<string[]> {
    const res = axios({
      url: query,
      method: "get",
    }).catch((_) => null);

    if (!res) throw new Error("AttachmentSearchError: Invalid Url Provided");

    return [query];
  }
  /**
   * @method getInfo
   * @description gets info of the attachment
   * @param {string} query url
   */
  public async getInfo(query: string): Promise<AttachmentInfoType> {
    const arr: string[] = query.split("/");

    return {
      title: arr[arr.length - 1],
      description: "An Attachment Or Url",
      url: query,
      duration: await getAudioDurationInSeconds(query),
    };
  }
  /**
   * @method getStream
   * @description gets the stream data of url
   * @param {string} url url
   */
  public async getStream(url: string): AttachmentStreamType {
    const { data: stream } = await axios({
      method: "get",
      responseType: "stream",
      url: url,
    }).catch((_) => null);

    return stream;
  }
}

export class Youtube {
  public get baseURL(): string[] {
    return [
      "https://youtube.com",
      "https://youtu.be",
      "https://music.youtube.com",
      "https://www.youtube.com/",
    ];
  }
  public async search(track: string, limit = 1) {
    if (this.baseURL.some((x) => track.startsWith(x))) {
      if (track.includes("/playlist?list=")) {
        let data = await yts.getPlaylistInfo(track, { full: true });

        if (!data.allLoaded()) {
          data = await data.fetch();
        }

        return data.tracks.map((x) => x.url);
      } else if (track.includes("?v=") && track.includes("&list=")) {
        const rawData: string = (await axios.get(track)).data;
        const parsedData: YoutubeMixPlaylistData = ytMixHTMLParser(rawData);
        const data = YoutubeMix(parsedData);
        return data;
      } else {
        return [track];
      }
    } else {
      const data = await yts.search(track);

      const vid = data.videos.slice(0, limit);

      return vid;
    }
  }
  public async getInfo(url: string): Promise<yts.YoutubeVideo> {
    const info = await yts.getVideoInfo(url, true);
    return info;
  }
  public async getStream(info: yts.YoutubeVideo) {
    if (!info.formats.length) throw new Error("429 : Rate Limited!");
    else {
      // console.log({
      //   bits: info.formats.map(
      //     (c) => `${c.audioBitrate} | ${c.hasAudio} | ${c.hasVideo}`,
      //   ),
      //   rate: info.formats.map(
      //     (c) => `${c.audioSampleRate} | ${c.hasAudio} | ${c.hasVideo}`,
      //   ),
      //   depth : info.formats.map(
      //     (c) => `${c.audioChannels} | ${c.hasAudio} | ${c.hasVideo}`,
      //   ),
      // });
      const stream = info.download(
        info.formats.find((x) => x.hasAudio && !x.hasVideo && x.audioBitrate),
        { chunkMode: { chunkSize: 512000 }, pipe: false, debug: true },
      );
      return stream;
    }
  }
  public async related(id: string, limit = 1) {
    const rawData = ytRelatedHTMLParser(
      (await axios.get(`https://youtube.com/watch?v=${id}`)).data,
    );
    const links = YoutubeRelated(rawData).slice(0, limit);
    const res = [];
    for (const link of links) {
      const info = await yts.getVideoInfo(link, true);
      res.push(info);
    }
    return res;
  }
}

export class Spotify {
  async search(track: string) {
    return [track];
  }
  async getInfo(track: string) {
    return await getTracks(track);
  }
  async getStream(track: string) {
    const info = await yts.getVideoInfo((await yts.search(track)).videos[0].id);

    if (!info.formats.length) throw new Error("429 : Rate Limited!");
    else {
      const stream = info.download(
        info.formats.find((x) => x.hasAudio && !x.hasVideo && x.audioBitrate),
        { chunkMode: { chunkSize: 512000 }, pipe: false, debug: true },
      );
      return { ytData: info, stream };
    }
  }
}

export class Search {
  public soundcloud: SoundCloud;
  public localFile: LocalFile = new LocalFile();
  public attachment: Attachments = new Attachments();
  public spotify: Spotify = new Spotify();
  public youtube: Youtube = new Youtube();
  constructor(data: SoundcloudOptions) {
    this.soundcloud = new SoundCloud({ clientId: data.clientId });
  }

  public async search({
    query,
    type,
    limit = 1,
  }: {
    query: string;
    limit?: number;
    type: number;
  }): Promise<any[]> {
    let result: any[];
    if (type === 0) {
      result = (await this.soundcloud.search({
        query,
        limit,
        scOptions: this.soundcloud.options,
      })).map(x => typeof x === "string" ? x : x.permalink_url);
    } else if (type === 1) {
      result = await this.localFile.search(query);
    } else if (type === 2) {
      result = await this.attachment.search(query);
    } else if (type === 3) {
      result = (await this.youtube.search(query, limit)).map((x: any) =>
        typeof x === "string" ? x : x.url,
      );
    } else if (type === 4) {
      result = await this.spotify.search(query);
    }

    return result;
  }
}
