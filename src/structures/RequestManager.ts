import {
	AudioResource,
	createAudioResource,
	StreamType,
} from "@discordjs/voice";
import { ReadStream } from "fs";
import { Search } from "../utils/source/Search";
import Player from "./Player";
import Track from "./Track";

export default class requestManager {
	public nextStream: AudioResource = null;
	public currentStream: AudioResource = null;
	public search: Search;
	private player: Player;
	constructor(player: Player) {
		this.player = player;
		this.search = player.manager.searchManager;
	}
	/**
	 * @param  {Track} track
	 * @returns {Promise<void>}
	 */
	public async setCurrentStream(track: Track): Promise<void> {
		let stream: ReadStream;
		if (track.source === 0) {
			stream = await this.search.soundCloud.getStream(
				track.rawInfo.permalink_url,
			);
		} else if (track.source === 1) {
			stream = await this.search.localFile.getStream(track.rawInfo.path);
		} else if (track.source === 2) {
			stream = await this.search.attachment.getStream(track.rawInfo.url);
		}
		const resource = createAudioResource(stream, {
			inlineVolume: true,
			inputType: StreamType.Arbitrary,
		});
		this.currentStream = resource;
	}
	/**
	 * @param  {Track} track
	 * @returns {Promise<void>}
	 */
	public async setNextStream(track: Track): Promise<void> {
		let stream: ReadStream;
		if (!track) this.nextStream = null;
		else if (track.source === 0) {
			stream = await this.search.soundCloud.getStream(
				track.rawInfo.permalink_url,
			);
		} else if (track.source === 1) {
			stream = await this.search.localFile.getStream(track.rawInfo.path);
		} else if (track.source === 2) {
			stream = await this.search.attachment.getStream(track.rawInfo.url);
		}
		const resource = createAudioResource(stream, {
			inlineVolume: true,
			inputType: StreamType.Arbitrary,
		});
		this.nextStream = resource;
	}
	/**
	 * @returns {number}
	 */
	public get _currentDuration(): number {
		return this.currentStream.playbackDuration;
	}
	/**
	 * e
	 */
	/**
	 * @param  {number} number
	 * @returns void
	 */
	public _setVolume(number: number): void {
		return this.currentStream.volume.setVolume(number);
	}
}
