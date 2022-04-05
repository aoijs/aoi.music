# Patches  
>Removed `console.log` from src code 

>`Player#skipTo(position:number)` now plays the next track after skipping instead of just skipping in queue and not stopping the current

>Fixed `RequestManager#setCurrentStream` filter system to be more consistent

>Fixed Soundcloud sending no like track Info on limit=-1 and set default likeTrack limit to 200 (changable)

# Features 
>Added `ManagerConfig#soundcloud.likeTrackLimit?: number`

>Added YoutubeMix Support in type 3 ***(experimental)***

>Added `Player#extraData` //youtube property contains MixData ***(experimental)***

>Added `ytMixHTMLParser(ytData:string)` ***(experimental)***

>Added `ytRelatedHTMLParser(ytData:string)` ***(experimental)***

>Added `YoutubeMix(ytData:string)` ***(experimental)***

>Added `YoutubeRelated(ytData:string)` ***(experimental)***

>Added `Youtube#related(id:string,limit?:number)` ***(experimental)*** 

# BreakingChanges 
>Renamed `Manager#searchManager.soundCloud` -> `Manager#searchManager.soundcloud`

# Bumps
>@discordjs/voice : 0.7.5 -> 0.8.0

>@types/node : dep -> devDep

>axios : 0.24.0 -> 0.26.1

>discord.js : 13.5.0 -> 13.6.0

>ffmpeg-static : 4.4.0 -> 5.0.0

>get-audio-duration : 3.0.0 -> 3.1.0