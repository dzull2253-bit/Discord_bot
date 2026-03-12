const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require("@discordjs/voice");
const ytdl = require("ytdl-core");

const queues = {};

module.exports = {
  handleMessage: async function(message){
    if(message.author.bot) return;
    const args = message.content.split(" ");
    const cmd = args[0].toLowerCase();
    const guildId = message.guild.id;

    if(!queues[guildId]) queues[guildId] = { songs: [], player: null, connection: null };
    const queue = queues[guildId];

    function playSong() {
      if(queue.songs.length === 0){
        queue.connection.destroy();
        queue.player = null;
        return;
      }
      const resource = createAudioResource(ytdl(queue.songs[0], { filter:"audioonly", highWaterMark: 1<<25 }));
      queue.player.play(resource);
      queue.connection.subscribe(queue.player);
    }

    if(cmd === "!play"){
      if(!args[1]) return message.reply("Masukkan URL!");
      const channel = message.member.voice.channel;
      if(!channel) return message.reply("Join voice channel dulu!");

      queue.songs.push(args[1]);

      if(!queue.player){
        queue.connection = joinVoiceChannel({
          channelId: channel.id,
          guildId: guildId,
          adapterCreator: message.guild.voiceAdapterCreator
        });

        queue.player = createAudioPlayer();

        queue.player.on(AudioPlayerStatus.Idle, ()=>{
          queue.songs.shift();
          playSong();
        });

        queue.player.on('error', error => console.error('Audio Player Error:', error));
        queue.connection.on('error', error => console.error('Voice Connection Error:', error));

        playSong();
      }

      message.reply(`🎵 Lagu ditambahkan ke queue.`);
    }

    if(cmd === "!skip"){
      if(queue.player && queue.songs.length>1){
        queue.player.stop();
        message.reply("⏭ Lagu di-skip!");
      } else message.reply("Tidak ada lagu untuk skip");
    }

    if(cmd === "!resume"){
      if(queue.player){
        queue.player.unpause();
        message.reply("▶️ Lagu dilanjutkan!");
      }
    }

    if(cmd === "!stop"){
      if(queue.player && queue.connection){
        queue.player.stop();
        queue.connection.destroy();
        queue.songs = [];
        queue.player = null;
        message.reply("⏹ Semua lagu stop");
      }
    }
  }
};
