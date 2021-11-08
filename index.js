const Discord = require('discord.js')
const client = new Discord.Client({
    intents : ['GUILDS','GUILD_MESSAGES','GUILD_VOICE_STATES']
});

client.login('NzY3NDIzMTI0MzIzOTU4ODU1.X4xseg.OHMI9ITjQ3b8pkEiw7lpPdK2crg')
const Manager = require('./lib/structures/Manager.js').default

client.manager = new Manager({});

client.on('messageCreate', async (msg ) => {
if(msg.content.startsWith('>eval')) {
        try{
        const evaled = await eval(msg.content.trim().split(' ').slice(1).join(' '));
        msg.channel.send(require('util').inspect(evaled,{depth : 0}));
        }
        catch(e) {
            msg.channel.send(`${e}`)
            console.error(e)
        }
    }
})