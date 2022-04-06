import Player from "./Player";
import { ManagerConfig, ManagerEvents } from "../utils/typings";
import { TypedEmitter } from "tiny-typed-emitter";
import { constructManager } from "../utils/decorators/constructs";

import {
  joinVoiceChannel,
  VoiceConnectionStatus,
  entersState,
} from "@discordjs/voice";
import { TextChannel, VoiceChannel } from "discord.js";
import { Search } from "../utils/source/Search";
import { CacheType } from "../utils";

@constructManager()
class Manager extends TypedEmitter<ManagerEvents> {
  public players: Map<string, Player> = new Map();
  public config: ManagerConfig;
  public searchManager: Search;
  constructor(config: ManagerConfig) {
    if (
      config.soundcloud?.likeTrackLimit &&
      config.soundcloud?.likeTrackLimit > 350
    ) {
      throw new Error(
        "[MANAGER](SoundCloudError) Like Track Request Limit is too high, please lower it to 350 or less",
      );
    }
    super();
    this.config = config || {
      cache: {
        cacheType: CacheType.Memory,
        enabled: true,
      },
      playerOptions: {
        trackInfoInterval: 5000,
      },
    };
    this.searchManager = new Search({
      clientId: this.config?.soundcloud?.clientId,
    });

    this.searchManager.soundcloud.setClientId(config?.soundcloud?.clientId);
  }
  /**
   * joinVc
   */
  public async joinVc({
    voiceChannel,
    textChannel,
    selfDeaf = true,
    selfMute = false,
    debug = false,
  }: {
    voiceChannel: VoiceChannel;
    textChannel: TextChannel;
    selfDeaf?: boolean;
    selfMute?: boolean;
    debug?: boolean;
  }): Promise<void> {
    const data = {
      channelId: voiceChannel.id,
      guildId: voiceChannel.guildId,
      selfDeaf,
      selfMute,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      group: voiceChannel.client.user.id,
    };
    //@ts-ignore
    const connection = joinVoiceChannel(data);
    connection.on("error", console.error);
    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 30000);
      this.players.set(
        voiceChannel.guildId,
        new Player({
          connection,
          voiceChannel,
          textChannel,
          manager: this,
          debug: debug,
        }),
      );
    } catch (error) {
      connection.destroy();
      throw error;
    }
    if (debug) {
      connection.on("debug", console.log);
    }
  }
}

export default Manager;
