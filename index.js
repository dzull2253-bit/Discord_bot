const { Client, GatewayIntentBits } = require("discord.js");
const meme = require("./modules/meme");
const music = require("./modules/music");
const schedule = require("node-schedule");

const client = new Client({
  intents:[
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const autoMemeChannelId = "1432040919682519264"; // ganti dengan channel auto meme

client.once("ready", ()=>{
  console.log(`Bot online sebagai ${client.user.tag}`);

  // Auto meme setiap pagi jam 08:00 & sore jam 18:00
  schedule.scheduleJob('0 8 * * *', async ()=>{
    const channel = client.channels.cache.get(autoMemeChannelId);
    if(channel) meme.sendAutoMeme(channel);
  });

  schedule.scheduleJob('0 18 * * *', async ()=>{
    const channel = client.channels.cache.get(autoMemeChannelId);
    if(channel) meme.sendAutoMeme(channel);
  });
});

client.on("messageCreate", async message=>{
  meme.handleMessage(message);
  music.handleMessage(message);
});

client.login(process.env.TOKEN);
