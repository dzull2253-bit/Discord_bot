// modules/music.js
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require("@discordjs/voice");
const ytdl = require("ytdl-core");

const queues = {}; // Queue per server

module.exports = {
  handleMessage: async function(message) {
    if (message.author.bot) return;

    const args = message.content.split(" ");
    const cmd = args[0].toLowerCase();
    const guildId = message.guild.id;

    if(!queues[guildId]) queues[guildId] = { songs: [], player: null, connection: null };
    const queue = queues[guildId];

    // ================= PLAY =================
    if(cmd === "!play") {
      if(!args[1]) return message.reply("Masukkan URL lagu!");
      const channel = message.member.voice.channel;
      if(!channel) return message.reply("Join voice channel dulu!");

      queue.songs.push(args[1]);

      // Kalau player belum ada, buat baru
      if(!queue.player) {
        queue.connection = joinVoiceChannel({
          channelId: channel.id,
          guildId: guildId,
          adapterCreator: message.guild.voiceAdapterCreator
        });

        queue.player = createAudioPlayer();

        // Event Idle → mainkan lagu berikutnya
        queue.player.on(AudioPlayerStatus.Idle, () => {
          queue.songs.shift();
          if(queue.songs.length > 0) {
            const resource = createAudioResource(ytdl(queue.songs[0], { filter: "audioonly" }));
            queue.player.play(resource);
          } else {
            queue.player.stop();
            queue.connection.destroy();
            queue.player = null;
            queue.connection = null;
          }
        });

        // Mainkan lagu pertama
        const resource = createAudioResource(ytdl(queue.songs[0], { filter: "audioonly" }));
        queue.player.play(resource);
        queue.connection.subscribe(queue.player);
      }

      message.reply(`🎵 Lagu ditambahkan ke queue: ${args[1]}`);
    }

    // ================= SKIP =================
    if(cmd === "!skip") {
      if(queue.player && queue.songs.length > 1) {
        queue.player.stop(); // Idle event otomatis mainkan lagu berikutnya
        message.reply("⏭ Lagu di-skip!");
      } else message.reply("Tidak ada lagu untuk di-skip");
    }

    // ================= RESUME =================
    if(cmd === "!resume") {
      if(queue.player) {
        queue.player.unpause();
        message.reply("▶️ Lagu dilanjutkan!");
      } else message.reply("Tidak ada lagu yang dipause");
    }

    // ================= STOP =================
    if(cmd === "!stop") {
      if(queue.player && queue.connection) {
        queue.player.stop();
        queue.connection.destroy();
        queue.songs = [];
        queue.player = null;
        queue.connection = null;
        message.reply("⏹ Semua lagu dihentikan dan keluar channel");
      } else message.reply("Tidak ada lagu yang sedang dimainkan");
    }
  }
};
