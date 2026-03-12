const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");

const client = new Client({
  intents:[
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const channelId = "ID_CHANNEL_DISCORD"; // ganti dengan ID channel untuk auto meme
const subredditList = ["memes", "dankmemes", "funny", "wholesomememes"]; // subreddit yang akan diambil

// Fungsi untuk mengambil meme random dari subreddit
async function getRedditMeme(subreddit){
  try{
    const res = await axios.get(`https://meme-api.com/gimme/${subreddit}`);
    return res.data.url;
  }catch(e){
    console.error("Gagal mengambil meme:", e.message);
    return null;
  }
}

// Fungsi untuk mengirim meme ke channel
async function sendMeme(channel){
  const randomSub = subredditList[Math.floor(Math.random()*subredditList.length)];
  const memeUrl = await getRedditMeme(randomSub);
  if(memeUrl) channel.send(memeUrl);
}

client.once("ready", ()=>{
  console.log(`Bot meme online sebagai ${client.user.tag}`);

  // Auto meme setiap 10 menit
  const channel = client.channels.cache.get(channelId);
  if(channel){
    setInterval(()=>sendMeme(channel), 10*60*1000); // 10 menit
  }else{
    console.log("Channel ID salah atau belum tersedia");
  }
});

// Command manual !meme
client.on("messageCreate", async message =>{
  if(message.author.bot) return;

  if(message.content.toLowerCase() === "!meme"){
    const randomSub = subredditList[Math.floor(Math.random()*subredditList.length)];
    const memeUrl = await getRedditMeme(randomSub);
    if(memeUrl) message.reply(memeUrl);
  }
});

client.login(process.env.TOKEN);
