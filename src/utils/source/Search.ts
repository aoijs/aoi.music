import scdl from 'soundcloud-downloader';
import fs from 'fs';
import path from 'path'
import { SoundcloudOptions } from '../typings';
import { constructSoundcloud } from '../decorators/constructs';

@constructSoundcloud()
class SoundCloud {
    public options: SoundcloudOptions = { clientId: "" };
    constructor(config?: SoundcloudOptions) {
        this.options = config;
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
    public async search({ query, scOptions = this.options }: { query: string; scOptions?: SoundcloudOptions; }): Promise<any> {
        if (this.baseURL.some(x => query.startsWith(x))) {
            query = this.parseURL(query);
            if (query.split('/')[4] === 'sets') {
                const set = await scdl.getSetInfo(query)//SCDL.getSetInfo(url: string): Promise<SetInfo>
                return set.tracks.map(x => x.permalink_url)
            }
            else if (query.endsWith('likes') && query.split('/').length === 4) {
                const arr = query.split("/")
                arr.pop();
                const likeUrl = arr.join("/")
                const { collection } = await scdl.getLikes({ profileUrl: likeUrl })
                return collection.map(x => x.track.permalink_url)
            }
            else {
                return [query] // hardest line 
            }
        }
        else {
            const { collection } = await scdl.search({ limit: 1, query }).catch(f => null)
            if (!collection) return;
            // fixed e
            return collection[0].permalink_url;
        }
    }
    /**
     * @method getInfo
     * @description gets the Data of the Url Provided
     * @param {string} url url of the track
     */
    public async getInfo(url: string): Promise<any> {
        const info = await scdl.getInfo(url).catch(_ => null)
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

class LocalFile {
    /**
     * search
     */
    public async search(query: string): Promise<string> {
        if (!fs.existsSync(query)) return;

        return query
    }
    /**
     * name
     */
    public async getInfo(query: string) {
        return {
            title: path.basename(query),
            description: 'A Local File',
            path: query,
            dir: path.dirname(query)
        }
    }
    /**
     * getStream
     */
    public async getStream(query: string,): Promise<fs.ReadStream | void> {
        let stream;
        try {
            stream = fs.createReadStream(query);
        }
        catch (e) {
            throw new Error(e)
        }

        return stream;
    }
}
