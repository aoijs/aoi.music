"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceProviders = exports.LoopMode = exports.PlayerStates = exports.CacheType = void 0;
var CacheType;
(function (CacheType) {
    CacheType["Disk"] = "disk";
    CacheType["Memory"] = "memory";
})(CacheType = exports.CacheType || (exports.CacheType = {}));
var PlayerStates;
(function (PlayerStates) {
    PlayerStates[PlayerStates["Idling"] = 0] = "Idling";
    PlayerStates[PlayerStates["Playing"] = 1] = "Playing";
    PlayerStates[PlayerStates["Paused"] = 2] = "Paused";
    PlayerStates[PlayerStates["Destroyed"] = 3] = "Destroyed";
})(PlayerStates = exports.PlayerStates || (exports.PlayerStates = {}));
var LoopMode;
(function (LoopMode) {
    LoopMode[LoopMode["None"] = 0] = "None";
    LoopMode[LoopMode["Track"] = 1] = "Track";
    LoopMode[LoopMode["Queue"] = 2] = "Queue";
})(LoopMode = exports.LoopMode || (exports.LoopMode = {}));
var SourceProviders;
(function (SourceProviders) {
    SourceProviders[SourceProviders["Soundcloud"] = 0] = "Soundcloud";
    SourceProviders[SourceProviders["Twitch"] = 1] = "Twitch";
    SourceProviders[SourceProviders["LocalFile"] = 2] = "LocalFile";
    SourceProviders[SourceProviders["Attachment"] = 3] = "Attachment";
})(SourceProviders = exports.SourceProviders || (exports.SourceProviders = {}));
//# sourceMappingURL=constants.js.map