<p align="center">
  <a href="https://aoi.js.org">
    <img width="100" src="https://github.com/aoijs/website/blob/master/assets/images/aoimusic.png?raw=true" alt="aoi.music">
  </a>
</p>

<h1 align="center">@aoijs/aoi.music</h1>

@aoijs/aoi.music is a powerful TypeScript-based JavaScript library that adds music-related properties and lays a solid foundation for music operations in aoi.js. 

Whether you're building a music streaming app, a Discord bot with music capabilities, or any other music-related project, @aoijs/aoi.music is here to make your life easier!

## 🚀 Setup

To get started with @aoijs/aoi.music, follow these simple steps:

1. Install @aoijs/aoi.music via npm:

   ```bash
   npm install @aoijs/aoi.music
   ```

2. Import the Manager class and create a new instance:

   ```javascript
   const { Manager } = require("@aoijs/aoi.music");
   
   const manager = new Manager({
      devOptions: {
         debug: true, // Set to true for debugging purposes
      },
      searchOptions: {
         soundcloudClientId: "<YOUR_SOUNDCLOUD_CLIENT_ID>",
         youtubeCookie: "<YOUR_YOUTUBE_COOKIE>",
         youtubeAuth: "<YOUR_YOUTUBE_AUTH_PATH>",
         youtubegl: "<YOUR_YOUTUBE_COUNTRY_CODE>",
         youtubeClient: "WEB", // Options: "WEB", "ANDROID", "YTMUSIC"
      },
      requestOptions: {
         offsetTimeout: 10000, // Timeout in milliseconds for searching and skipping
         soundcloudLikeTrackLimit: 10, // Limit the number of liked tracks from SoundCloud
         youtubePlaylistLimit: 20, // Limit the number of tracks in a YouTube playlist
         spotifyPlaylistLimit: 30, // Limit the number of tracks in a Spotify playlist
      },
   });
   ```

## 📚 Documentation

For detailed information on how to use @aoijs/aoi.music, check out our [documentation](https://aoi.js.org/extensions/aoi.music/aoimusic-introduction). It contains comprehensive guides and examples to help you make the most out of this library.
