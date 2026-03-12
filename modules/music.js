const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require("@discordjs/voice");
const ytdl = require("ytdl-core");

module.exports = {
  handleMessage: async function(message){
    if(message.author.bot) return;
    const args = message.content.split(" ");
    const cmd = args[0].toLowerCase();

    if(cmd === "!play"){
      if(!args[1]) return message.reply("Masukkan URL lagu!");
      const channel = message.member.voice.channel;
      if(!channel) return message.reply("Join voice channel dulu!");
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator
      });
      const stream = ytdl(args[1], { filter: "audioonly" });
      const resource = createAudioResource(stream);
      const player = createAudioPlayer();
      player.play(resource);
      connection.subscribe(player);
      message.reply(`🎵 Playing now!`);
    }

    if(cmd === "!stop"){
      const channel = message.member.voice.channel;
      if(channel){
        const connection = joinVoiceChannel({
          channelId: channel.id,
          guildId: message.guild.id,
          adapterCreator: message.guild.voiceAdapterCreator
        });
        connection.destroy();
        message.reply("⏹ Stopped and left the channel");
      }
    }
  }
};
