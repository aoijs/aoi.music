"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerTypes = exports.PluginName = exports.PlatformType = exports.AutoPlay = exports.timeMultiPlier = exports.PlayerEvents = exports.SourceProviders = exports.LoopMode = exports.PlayerStates = exports.CacheType = void 0;
var CacheType;
(function (CacheType) {
    CacheType["Disk"] = "Disk";
    CacheType["Memory"] = "Memory";
})(CacheType || (exports.CacheType = CacheType = {}));
var PlayerStates;
(function (PlayerStates) {
    PlayerStates["Idling"] = "Idling";
    PlayerStates["Playing"] = "Playing";
    PlayerStates["Paused"] = "Paused";
    PlayerStates["Destroyed"] = "Destroyed";
})(PlayerStates || (exports.PlayerStates = PlayerStates = {}));
var LoopMode;
(function (LoopMode) {
    LoopMode["None"] = "none";
    LoopMode["Track"] = "song";
    LoopMode["Queue"] = "queue";
})(LoopMode || (exports.LoopMode = LoopMode = {}));
var SourceProviders;
(function (SourceProviders) {
    SourceProviders[SourceProviders["Soundcloud"] = 0] = "Soundcloud";
    SourceProviders[SourceProviders["Twitch"] = 1] = "Twitch";
    SourceProviders[SourceProviders["LocalFile"] = 2] = "LocalFile";
    SourceProviders[SourceProviders["Attachment"] = 3] = "Attachment";
})(SourceProviders || (exports.SourceProviders = SourceProviders = {}));
var PlayerEvents;
(function (PlayerEvents) {
    PlayerEvents["AudioError"] = "audioError";
    PlayerEvents["QueueStart"] = "queueStart";
    PlayerEvents["QueueEnd"] = "queueEnd";
    PlayerEvents["TrackStart"] = "trackStart";
    PlayerEvents["TrackEnd"] = "trackEnd";
    PlayerEvents["TrackAdd"] = "trackAdd";
    PlayerEvents["TrackPause"] = "trackPause";
    PlayerEvents["TrackResume"] = "trackResume";
})(PlayerEvents || (exports.PlayerEvents = PlayerEvents = {}));
exports.timeMultiPlier = [1, 60, 60, 24];
var AutoPlay;
(function (AutoPlay) {
    AutoPlay["None"] = "none";
    AutoPlay["Youtube"] = "youtube";
    AutoPlay["SoundCloud"] = "soundcloud";
    // Spotify = "spotify",
    AutoPlay["Relative"] = "relative";
})(AutoPlay || (exports.AutoPlay = AutoPlay = {}));
var PlatformType;
(function (PlatformType) {
    PlatformType[PlatformType["SoundCloud"] = 0] = "SoundCloud";
    PlatformType[PlatformType["LocalFile"] = 1] = "LocalFile";
    PlatformType[PlatformType["Url"] = 2] = "Url";
    PlatformType[PlatformType["Youtube"] = 3] = "Youtube";
    PlatformType[PlatformType["Spotify"] = 4] = "Spotify";
})(PlatformType || (exports.PlatformType = PlatformType = {}));
var PluginName;
(function (PluginName) {
    PluginName["Cacher"] = "cache";
    PluginName["Filter"] = "filter";
})(PluginName || (exports.PluginName = PluginName = {}));
var PlayerTypes;
(function (PlayerTypes) {
    PlayerTypes["Default"] = "default";
    PlayerTypes["FOnly"] = "fonly";
    PlayerTypes["Bidirect"] = "bidirect";
})(PlayerTypes || (exports.PlayerTypes = PlayerTypes = {}));
//# sourceMappingURL=enums.js.map