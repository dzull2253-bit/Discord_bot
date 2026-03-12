const { Client, GatewayIntentBits } = require("discord.js");
const meme = require("./modules/meme");
const music = require("./modules/music");
const schedule = require("node-schedule");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// ganti dengan ID channel Discord tempat auto meme
const AUTO_MEME_CHANNEL_ID = "1432040919682519264";

client.once("ready", () => {
  console.log(`Bot online sebagai ${client.user.tag}`);

  const channel = client.channels.cache.get(AUTO_MEME_CHANNEL_ID);
  if (channel) {
    // auto meme setiap 10 menit
    setInterval(() => meme.sendAutoMeme(channel), 10 * 60 * 1000);

    // contoh jadwal pagi & sore
    schedule.scheduleJob("0 8 * * *", () => meme.sendAutoMeme(channel, true));
    schedule.scheduleJob("0 18 * * *", () => meme.sendAutoMeme(channel, true));
  } else {
    console.log("⚠️ Channel auto meme tidak ditemukan (cek ID channel)");
  }
});

client.on("messageCreate", async (message) => {
  meme.handleMessage(message);
  music.handleMessage(message);
});

client.login(process.env.TOKEN);
