import scdl from 'soundcloud-downloader';
import fs from 'fs';
import path from 'path'
import axios from 'axios';

import { AttachmentInfoType, AttachmentStreamType, LocalInfoType, LocalStreamType, SoundcloudOptions } from '../typings';
import { constructSoundcloud } from '../decorators/constructs';

@constructSoundcloud()
export class SoundCloud {
    public options?: SoundcloudOptions = {clientId : undefined} ;
    constructor(config?: SoundcloudOptions) {
        this.options = config;
    }
    /**
     * @method setClientId
     * @description sets the clientId
     * @param {string} clientId clientId to be set
     */
     public setClientId(clientId : string): void  {
        this.options.clientId =  clientId
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
        return ['https://soundcloud.com', 'https://m.soundcloud.com']
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
    public async search({ query }: { query: string; scOptions?: SoundcloudOptions; }): Promise<any[]> {
        if (this.baseURL.some(x => query.startsWith(x))) {
            query = this.parseURL(query);

            if (query.split('/')[4] === 'sets') {
                const set = await scdl.getSetInfo(query).catch(_ => {
                    return {
                        tracks: []
                    }
                });//SCDL.getSetInfo(url: string): Promise<SetInfo>

                return set.tracks.map((x: {
                    permalink_url?: string;
                }) => x.permalink_url);

            }
            else if (query.endsWith('likes') && query.split('/').length === 4) {
                const arr = query.split("/");
                arr.pop();

                const likeUrl = arr.join("/");

                const { collection } = await scdl.getLikes({ profileUrl: likeUrl }).catch(_ => {
                    return {
                        collection: []
                    }
                });

                return collection.map((x: {
                    track?: {
                        permalink_url?: string;
                    };
                }) => x.track.permalink_url);

            }
            else {
                return [query]; // hardest line 
            }
        }
        else {
            const { collection } = await scdl.search({ limit: 1, query, resourceType: 'tracks' }).catch(_ => {
                return {
                    collection: []
                }
            });

            if (!collection.length) return [];
            // fixed e
            return [collection[0].permalink_url];
        }
    }
    /**
     * @method getInfo
     * @description gets the Data of the Url Provided
     * @param {string} url url of the track
     */
    public async getInfo(url: string): Promise<any> {
        const info = await scdl.getInfo(url).catch(_ => null);
        if (!info) return;

        return info;
    }
    /**
     * @method getStream
     * @description gets the stream data of the url provided
     * @param {string} url url of the track
     */
    public async getStream(url: string): Promise<any> {
        const stream = await scdl.download(url).catch(_ => null);
        if (!stream) return;

        return stream;
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

        return [query]
    }
    /**
     * @method getInfo
     * @description gets info of the path
     * @param {string} query path 
     */
    public async getInfo(query: string): Promise<LocalInfoType> {
        return {
            title: path.basename(query),
            description: 'A Local File',
            path: query,
            dir: path.dirname(query),
            createdTimestamp: fs.statSync(query).birthtimeMs
        }
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
        }
        catch (e) {
            throw new Error(e)
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
            method: 'get'
        }).catch(_ => null);

        if (!res) throw new Error('AttachmentSearchError: Invalid Url Provided');

        return [query];
    }
    /**
     * @method getInfo
     * @description gets info of the attachment
     * @param {string} query url
     */
    public async getInfo(query: string): Promise<AttachmentInfoType> {
        const arr: string[] = query.split('/');

        return {
            title: arr[arr.length - 1],
            description: 'An Attachment Or Url',
            url: query
        }
    }
    /**
     * @method getStream
     * @description gets the stream data of url
     * @param {string} url url
     */
    public async getStream(url: string): AttachmentStreamType {
        const { data: stream } = await axios({
            method: 'get',
            responseType: 'stream',
            url: url,
        }).catch(_ => null)
        
        return stream;
    }
}

export class Search {
    public soundCloud: SoundCloud ;
    public localFile: LocalFile = new LocalFile();
    public attachment: Attachments = new Attachments();
    constructor(data : SoundcloudOptions) {
        this.soundCloud = new SoundCloud({clientId : data.clientId})
    }

    public async search({ query, type }: { query: string; type: number; }): Promise<any[]> {
        let result: any[];
        if (type === 0) {
            result = await this.soundCloud.search({ query, scOptions: this.soundCloud.options });
        }
        else if (type === 1) {
            result = await this.localFile.search(query);
        }
        else if (type === 2) {
            result = await this.attachment.search(query)
        }

        return result;
    }
}