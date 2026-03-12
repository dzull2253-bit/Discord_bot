const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");

const client = new Client({
  intents:[
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ================= CONFIG =================
const channelId = "ID_CHANNEL_DISCORD"; // ganti dengan channel ID untuk auto meme
const subredditList = ["memes","dankmemes","funny","wholesomememes","ProgrammerHumor","gaming","anime","prequelmemes","HistoryMemes","me_irl"];
const gifList = {
  dance:["https://media.giphy.com/media/3o7aD6p0ZnW45g5tNa/giphy.gif","https://media.giphy.com/media/l2SqfBRNw7q3r6m1S/giphy.gif"],
  hug:["https://media.giphy.com/media/l2QDM9Jnim1YVILXa/giphy.gif","https://media.giphy.com/media/od5H3PmEG5EVq/giphy.gif"],
  cry:["https://media.giphy.com/media/ROF8OQvDmxytW/giphy.gif","https://media.giphy.com/media/9Y5BbDSkSTiY8/giphy.gif"]
};

// Lists
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

async function sendMeme(channel){
  const randomSub = subredditList[Math.floor(Math.random()*subredditList.length)];
  const memeUrl = await getRedditMeme(randomSub);
  if(memeUrl) channel.send(memeUrl);
}

function updateLeaderboard(userId, stat){
  if(!leaderboard[userId]) leaderboard[userId]={noob:0, simp:0, pro:0};
  leaderboard[userId][stat]++;
}

function randomPercent(){ return Math.floor(Math.random()*100); }
function randomIQ(){ return Math.floor(Math.random()*200); }

// ==================== READY ====================
client.once("ready", ()=>{
  console.log(`Bot super meme online sebagai ${client.user.tag}`);

  const channel = client.channels.cache.get(channelId);
  if(channel){
    setInterval(()=>sendMeme(channel), 10*60*1000); // 10 menit
  }else{
    console.log("Channel ID salah atau belum tersedia");
  }
});

// ==================== COMMAND ====================
client.on("messageCreate", async message=>{
  if(message.author.bot) return;
  const cmd = message.content.toLowerCase();

  const memberId = message.author.id;

  // ---------- MEME ----------
  if(cmd === "!meme"){
    const randomSub = subredditList[Math.floor(Math.random()*subredditList.length)];
    const memeUrl = await getRedditMeme(randomSub);
    if(memeUrl) message.reply(memeUrl);
  }

  // ---------- JOKE ----------
  if(cmd === "!joke"){
    const random = jokes[Math.floor(Math.random()*jokes.length)];
    message.reply(random);
  }

  // ---------- ROAST ----------
  if(cmd === "!roast"){
    const random = roasts[Math.floor(Math.random()*roasts.length)];
    message.reply(random);
  }

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
  if(cmd === "!gaymeter") message.reply(`🌈 Gay meter: ${randomPercent()}%`);
  if(cmd === "!simpmeter") message.reply(`❤️ Simp meter: ${randomPercent()}%`);
  if(cmd === "!coolrate") message.reply(`😎 Coolness kamu: ${randomPercent()}%`);
  if(cmd === "!luck") message.reply(`🍀 Luck hari ini: ${randomPercent()}%`);
  if(cmd === "!iq") message.reply(`🧠 IQ kamu: ${randomIQ()}`);

  // ---------- LEADERBOARD ----------
  if(cmd === "!leaderboard"){
    let lb = "🏆 Leaderboard lucu:\n";
    for(const [id, stats] of Object.entries(leaderboard)){
      lb += `<@${id}> → Noob:${stats.noob} | Simp:${stats.simp} | Pro:${stats.pro}\n`;
    }
    message.channel.send(lb || "Belum ada data leaderboard.");
  }

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

  // ---------- GIF LUCUL ----------
  if(cmd === "!dance" || cmd === "!hug" || cmd === "!cry"){
    const gifs = gifList[cmd.substring(1)];
    const gifUrl = gifs[Math.floor(Math.random()*gifs.length)];
    message.reply(gifUrl);
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
