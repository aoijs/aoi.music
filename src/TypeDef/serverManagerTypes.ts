import voice from '@discordjs/voice';
import { type } from 'os';
import Voice from '../Classes/voice';

export type Connection = voice.VoiceConnection;
export type TextChannel = Record<string,any>;
export type VoiceChannel = Record<string,any>;
export type VoiceData = Voice;
export type ServerManagerOptions = {
    connection : Connection;
    channel : VoiceChannel;
    textChannel : TextChannel;
    voice : VoiceData;
}