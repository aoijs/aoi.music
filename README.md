# @akarui/aoi.music

Addition of the Music properties and foundation for aoi.js

# Setup

```js
   const { Manager } = require("@akarui/aoi.music");
   const manager = new Manager(devOptions?: {
        debug: boolean;
    };
    searchOptions?: {
        soundcloudClientId?: string;
        youtubeCookie?: string;
        youtubeAuth?: PathLike;
        youtubegl?: string;
        youtubeClient?: "WEB" | "ANDROID" | "YTMUSIC"
    };
    requestOptions?: {
        offsetTimeout?: number;
        soundcloudLikeTrackLimit?: number;
        youtubePlaylistLimit?: number;
        spotifyPlaylistLimit?: number;
    };
      
   })
```

# links
[docs](https://akaruidevelopment.github.io/music)
