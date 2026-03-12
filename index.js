const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const axios = require("axios");

const client = new Client({
  intents:[
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ================= CONFIG =================
const channelId = "1432040919682519264"; // Ganti dengan ID channel auto meme
const subredditList = ["memes","dankmemes","funny","wholesomememes","ProgrammerHumor","gaming","anime","prequelmemes","HistoryMemes","me_irl"];
const giphyTags = ["funny","dance","hug","cry","meme","cat","dog","reaction"];

const keywordsResponse = {
  "hello":"Hello there! 👋",
  "hi":"Hi! 😄",
  "lag":"Server lagi lag ya? 🐌",
  "noob":"Hati-hati, noob detected! 🎮",
  "sus":"Hmm... suspicious 🤨"
};

// Joke & Roast lists
const jokes = [
  "Kenapa server selalu crash? Karena lelah menahan admin 😂",
  "Player bilang lag sedikit... server langsung mati",
  "Aku bukan AFK... aku sedang meditasi gaming",
  "Admin: server stabil. 2 menit kemudian restart server",
  "Creeper tidak sedih... dia hanya eksplosif 💥"
];

const roasts = [
  "Kamu bukan noob... kamu pro dalam gagal",
  "Skill kamu setipis sinyal di gunung",
  "Kamu main bukan untuk menang, tapi untuk hiburan kami",
  "Kamu tidak buruk... hanya sangat kreatif dalam kalah",
  "Ping kamu lebih stabil dari gameplay kamu"
];

let leaderboard = {}; // untuk leaderboard lucu

// ==================== Fungsi ====================
async function getRedditMeme(subreddit){
  try{
    const res = await axios.get(`https://meme-api.com/gimme/${subreddit}`);
    return res.data.url;
  }catch(e){
    console.error("Gagal ambil meme:", e.message);
    return null;
  }
}

async function getGiphyRandom(tag){
  try{
    const res = await axios.get(`https://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=${tag}&rating=pg-13`);
    return res.data.data.images.original.url;
  }catch(e){
    console.error("Gagal ambil GIF:", e.message);
    return null;
  }
}

async function sendAutoMeme(channel){
  // 50% chance meme Reddit, 50% GIF Giphy
  const isMeme = Math.random()<0.5;
  if(isMeme){
    const randomSub = subredditList[Math.floor(Math.random()*subredditList.length)];
    const memeUrl = await getRedditMeme(randomSub);
    if(memeUrl) channel.send(memeUrl);
  } else {
    const randomTag = giphyTags[Math.floor(Math.random()*giphyTags.length)];
    const gifUrl = await getGiphyRandom(randomTag);
    if(gifUrl) channel.send(gifUrl);
  }
}

function updateLeaderboard(userId, stat){
  if(!leaderboard[userId]) leaderboard[userId]={noob:0, simp:0, pro:0};
  leaderboard[userId][stat]++;
}

function createLeaderboardEmbed(){
  const embed = new EmbedBuilder()
    .setTitle("🏆 Leaderboard Lucu Server")
    .setColor("#FF69B4")
    .setTimestamp();

  // Top 5 Noob
  const topNoob = Object.entries(leaderboard).sort((a,b)=>b[1].noob - a[1].noob).slice(0,5);
  embed.addFields({name:"Top 5 Noob", value:topNoob.map(([id,stats])=>`<@${id}> → ${stats.noob}`).join("\n") || "Belum ada data"});

  // Top 5 Simp
  const topSimp = Object.entries(leaderboard).sort((a,b)=>b[1].simp - a[1].simp).slice(0,5);
  embed.addFields({name:"Top 5 Simp", value:topSimp.map(([id,stats])=>`<@${id}> → ${stats.simp}`).join("\n") || "Belum ada data"});

  // Top 5 Pro
  const topPro = Object.entries(leaderboard).sort((a,b)=>b[1].pro - a[1].pro).slice(0,5);
  embed.addFields({name:"Top 5 Pro", value:topPro.map(([id,stats])=>`<@${id}> → ${stats.pro}`).join("\n") || "Belum ada data"});

  return embed;
}

// ==================== READY ====================
client.once("ready", ()=>{
  console.log(`Bot pro meme online sebagai ${client.user.tag}`);

  const channel = client.channels.cache.get(channelId);
  if(channel){
    setInterval(()=>sendAutoMeme(channel), 10*60*1000); // 10 menit
  }else{
    console.log("Channel ID salah atau belum tersedia");
  }
});

// ==================== COMMAND ====================
client.on("messageCreate", async message=>{
  if(message.author.bot) return;
  const cmd = message.content.toLowerCase();
  const memberId = message.author.id;

  // ---------- HELP ----------
  if(cmd === "!help"){
    const helpEmbed = new EmbedBuilder()
      .setTitle("📜 Command List")
      .setColor("#00FFFF")
      .setDescription(`
!meme - Meme random dari Reddit/Giphy
!joke - Random joke
!roast - Roast lucu
!slap, !cry, !sus, !simp, !noob, !pro, !bonk - Command troll
!gaymeter, !simpmeter, !coolrate, !luck, !iq - Random fun stats
!who_noob, !who_pro, !who_sus - Random member lucu
!leaderboard - Lihat leaderboard embed
!dance, !hug, !cry - GIF lucu
!8ball - 8ball fortune
`)
    message.channel.send({embeds:[helpEmbed]});
  }

  // ---------- MEME ----------
  if(cmd === "!meme") await sendAutoMeme(message.channel);

  // ---------- JOKE ----------
  if(cmd === "!joke") message.reply(jokes[Math.floor(Math.random()*jokes.length)]);

  // ---------- ROAST ----------
  if(cmd === "!roast") message.reply(roasts[Math.floor(Math.random()*roasts.length)]);

  // ---------- TROLL ----------
  if(cmd === "!slap"){ updateLeaderboard(memberId,"noob"); message.reply(`${message.author} menampar seseorang 👋`); }
  if(cmd === "!cry"){ message.reply(`${message.author} menangis di pojok 😭`); }
  if(cmd === "!sus"){ updateLeaderboard(memberId,"noob"); message.reply(`${message.author} terlihat sangat SUS 🤨`); }
  if(cmd === "!simp"){ updateLeaderboard(memberId,"simp"); message.reply(`${message.author} adalah SIMP tingkat dewa 🫡`); }
  if(cmd === "!noob"){ updateLeaderboard(memberId,"noob"); message.reply(`${message.author} certified NOOB 🎮`); }
  if(cmd === "!pro"){ updateLeaderboard(memberId,"pro"); message.reply(`${message.author} pemain PRO 😎`); }
  if(cmd === "!touchgrass"){ message.reply(`${message.author} disuruh keluar rumah 🌿`); }
  if(cmd === "!bonk"){ message.reply(`${message.author} kena bonk horny jail 🔨`); }

  // ---------- RANDOM FUN ----------
  if(cmd === "!gaymeter") message.reply(`🌈 Gay meter: ${Math.floor(Math.random()*100)}%`);
  if(cmd === "!simpmeter") message.reply(`❤️ Simp meter: ${Math.floor(Math.random()*100)}%`);
  if(cmd === "!coolrate") message.reply(`😎 Coolness kamu: ${Math.floor(Math.random()*100)}%`);
  if(cmd === "!luck") message.reply(`🍀 Luck hari ini: ${Math.floor(Math.random()*100)}%`);
  if(cmd === "!iq") message.reply(`🧠 IQ kamu: ${Math.floor(Math.random()*200)}`);

  // ---------- LEADERBOARD ----------
  if(cmd === "!leaderboard") message.channel.send({embeds:[createLeaderboardEmbed()]});

  // ---------- WHO RANDOM ----------
  if(cmd === "!who_noob"){ 
    const members = message.guild.members.cache.random();
    message.reply(`🎯 Noob hari ini: ${members}`);
  }
  if(cmd === "!who_pro"){ 
    const members = message.guild.members.cache.random();
    message.reply(`🔥 Pro player hari ini: ${members}`);
  }
  if(cmd === "!who_sus"){ 
    const members = message.guild.members.cache.random();
    message.reply(`🤨 Yang paling SUS: ${members}`);
  }

  // ---------- 8BALL ----------
  if(cmd === "!8ball"){
    const answers=["Ya","Tidak","Mungkin","Coba lagi nanti","Tentu saja","Tidak mungkin"];
    message.reply(answers[Math.floor(Math.random()*answers.length)]);
  }

  // ---------- GIF ----------
  if(cmd === "!dance" || cmd === "!hug" || cmd === "!cry"){
    const gifs = gifList[cmd.substring(1)];
    const gifUrl = gifs[Math.floor(Math.random()*gifs.length)];
    message.reply(gifUrl);
  }

  // ---------- KEYWORDS RESPONSE ----------
  for(const [key,res] of Object.entries(keywordsResponse)){
    if(message.content.toLowerCase().includes(key)) message.reply(res);
  }

  // ---------- FAKE TROLL ----------
  if(cmd === "!hack"){
    message.reply("💻 Menghack akun...");
    setTimeout(()=>message.channel.send("📂 Mengambil data..."),2000);
    setTimeout(()=>message.channel.send("📡 Upload ke FBI..."),4000);
    setTimeout(()=>message.channel.send("✅ Hack selesai (just kidding 😂)"),6000);
  }
  if(cmd === "!banme") message.reply("🚫 Kamu telah diban... eh bercanda 🤡");
  if(cmd === "!serverexplode"){
    message.reply("💣 Server akan meledak dalam 3...");
    setTimeout(()=>message.channel.send("2..."),1000);
    setTimeout(()=>message.channel.send("1..."),2000);
    setTimeout(()=>message.channel.send("💥 BOOM (server aman kok)"),3000);
  }

});

client.login(process.env.TOKEN);
