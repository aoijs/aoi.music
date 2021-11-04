
import ServerManager from '../Classes/serverManager'

export type K = string;
export type V = ServerManager;

export type YTOptions = object;
export type SCOptions = {
    clientId?: string;
}
export type CacheOptions = {
    enabled? : boolean;
    cacheType? : 'disk' | 'memory';
    limit? : number;
}

export type Client = any