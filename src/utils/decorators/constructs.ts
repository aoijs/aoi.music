import Manager from '../../structures/Manager';
import { CacheOptions, ManagerConfig } from '../typings';
import key from 'soundcloud-key-fetch';
import { CacheType } from '../constants';

export function decorateConstructor(func: (target, args: any[]) => any) {
    return function decorate(target) {
      return new Proxy(target, {
        construct(constructor, args) {
          return func(constructor, args)
        }
      })
    }
  }

export function constructManager(): (target) => any {
    return decorateConstructor((manager, args) => {
        const config = args[0] as ManagerConfig;
        if (config.soundcloud) {
            const opt = config.soundcloud;
            if (typeof opt.clientId !== "string" || !opt.clientId) {
                key.fetchKey().then(string => opt.clientId = string);
            }
        }
        return new manager(config);
    });
}

export function constructCache(): (target) => any {
    return decorateConstructor((manager, args) => {
        const config = args[0] as CacheOptions;

        if (!config.enabled) 
            throw new Error(`Cache is not enabled, but "new" is declared`);
        if (! ("cacheType" in config) || !CacheType[config.cacheType] || isNaN(CacheType[config.cacheType]))
            throw new Error(`Cache Type is invalid`);
        if (config.cacheType === CacheType.Disk && (typeof config.directory !== "string" || !config.directory))
            throw new Error("Cache Type is Disk, but directory is not a string");
        if ("limit" in config && isNaN(config.limit))
            throw new TypeError("Cache Limit must be a number");
        
        return new manager(config);
    });
}