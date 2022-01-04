import Player from "./Player";
import {
  ManagerConfig,
  ManagerEvents,
} from "../utils/typings";
import { TypedEmitter } from "tiny-typed-emitter";
import { constructManager } from "../utils/decorators/constructs";

import {
  joinVoiceChannel,
  VoiceConnectionStatus,
  entersState,
} from "@discordjs/voice";
import { TextChannel, VoiceChannel } from "discord.js";
import { Search } from "../utils/source/Search";
import CacheManager from "./Cache";
import { CacheType } from "../utils/constants";

@constructManager()
class Manager extends TypedEmitter<ManagerEvents> {
  public players: Map<string, Player> = new Map();
  public config: ManagerConfig;
  public searchManager: Search;
  constructor(config: ManagerConfig) {
    super();
    this.config = config;
    this.searchManager = new Search({
      clientId: this.config.soundcloud.clientId,
    });

    this.searchManager.soundCloud.setClientId(config.soundcloud?.clientId);
  }
  /**
   * joinVc
   */
  public async joinVc({
    voiceChannel,
    textChannel,
    debug = false,
  }: {
    voiceChannel: VoiceChannel;
    textChannel: TextChannel;
    debug?: boolean;
  }): Promise<void> {
    const data = {
      channelId: voiceChannel.id,
      guildId: voiceChannel.guildId,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      group: voiceChannel.client.user.id,
    };
//@ts-ignore
    const connection = joinVoiceChannel(data);
    if (debug) {
      connection.on("debug", console.log);
    }
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
          debug: true,
        }),
      );
    } catch (error) {
      connection.destroy();
      console.error("joinVoiceChannelError :" + error);
    }
  }
}

export default Manager;
