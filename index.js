const { Client, GatewayIntentBits } = require("discord.js");
const meme = require("./modules/meme");
const music = require("./modules/music");

const client = new Client({
  intents:[
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const channelId = "ID_CHANNEL_DISCORD"; // ganti dengan ID channel auto meme

client.once("ready", ()=>{
  console.log(`Bot online sebagai ${client.user.tag}`);
  const channel = client.channels.cache.get(channelId);
  if(channel){
    setInterval(()=>meme.sendAutoMeme(channel),10*60*1000);
  }else console.log("Channel ID salah atau belum tersedia");
});

client.on("messageCreate", async message=>{
  meme.handleMessage(message);
  music.handleMessage(message);
});

client.login(process.env.TOKEN);
