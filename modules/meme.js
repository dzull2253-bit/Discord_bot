const { EmbedBuilder } = require("discord.js");
const axios = require("axios");

const subredditList = [
  "memes","dankmemes","funny","wholesomememes","ProgrammerHumor",
  "gaming","anime","prequelmemes","HistoryMemes","me_irl"
];
const giphyTags = ["funny","dance","hug","cry","meme","cat","dog","reaction"];

const jokes = [
  "Kenapa server selalu crash? Karena lelah menahan admin 😂",
  "Player bilang lag sedikit... server langsung mati",
  "Aku bukan AFK... aku sedang meditasi gaming",
  "Admin: server stabil. 2 menit kemudian restart server",
  "Creeper tidak sedih... dia hanya eksplosif 💥",
  "We wok de tok... Kena ketok"
];

const roasts = [
  "Kamu bukan noob... kamu pro dalam gagal",
  "Skill kamu setipis sinyal di gunung",
  "Kamu main bukan untuk menang, tapi untuk hiburan kami",
  "Kamu tidak buruk... hanya sangat kreatif dalam kalah",
  "Ping kamu lebih stabil dari gameplay kamu"
];

let leaderboard = {};
const keywordsResponse = {
  "hello":"Hello there! 👋",
  "hi":"Hi! 😄",
  "lag":"Server lagi lag ya? 🐌",
  "noob":"Hati-hati, noob detected! 🎮",
  "sus":"Hmm... suspicious 🤨"
};

async function getRedditMeme(subreddit){
  try{
    const res = await axios.get(`https://meme-api.com/gimme/${subreddit}`);
    return res.data;
  }catch(e){ console.error(e); return null; }
}

async function getGiphyRandom(tag){
  try{
    const res = await axios.get(`https://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=${tag}&rating=pg-13`);
    return res.data.data;
  }catch(e){ console.error(e); return null; }
}

async function sendAutoMeme(channel){
  const isMeme = Math.random() < 0.5;

  const embed = new EmbedBuilder().setColor("Random").setTimestamp();

  if (isMeme) {
    const random = subredditList[Math.floor(Math.random() * subredditList.length)];
    const meme = await getRedditMeme(random);
    if (!meme) return;
    embed.setTitle(meme.title || `Meme dari r/${random}`);
    embed.setImage(meme.url);
    channel.send({ embeds: [embed] });
  } else {
    const tag = giphyTags[Math.floor(Math.random() * giphyTags.length)];
    const gif = await getGiphyRandom(tag);
    if(!gif) return;
    embed.setTitle(`GIF: ${tag}`);
    embed.setImage(gif.images.original.url);
    channel.send({ embeds: [embed] });
  }
}

function updateLeaderboard(userId, stat){
  if(!leaderboard[userId]) leaderboard[userId]={noob:0, simp:0, pro:0};
  leaderboard[userId][stat]++;
}

function createLeaderboardEmbed(){
  const embed = new EmbedBuilder()
    .setTitle("🏆 Leaderboard Lucu Server")
    .setColor("Blue")
    .setTimestamp();

  const topNoob = Object.entries(leaderboard).sort((a,b)=>b[1].noob - a[1].noob).slice(0,5);
  embed.addFields({name:"Top Noob", value: topNoob.map(([id,s])=>`<@${id}> → ${s.noob}`).join("\n") || "Belum ada data"});

  const topSimp = Object.entries(leaderboard).sort((a,b)=>b[1].simp - a[1].simp).slice(0,5);
  embed.addFields({name:"Top Simp", value: topSimp.map(([id,s])=>`<@${id}> → ${s.simp}`).join("\n") || "Belum ada data"});

  const topPro = Object.entries(leaderboard).sort((a,b)=>b[1].pro - a[1].pro).slice(0,5);
  embed.addFields({name:"Top Pro", value: topPro.map(([id,s])=>`<@${id}> → ${s.pro}`).join("\n") || "Belum ada data"});

  return embed;
}

module.exports = {
  handleMessage: async function(message){
    if(message.author.bot) return;
    const cmd = message.content.toLowerCase();
    const id = message.author.id;

    if(cmd === "!help"){
      const helpEmbed = new EmbedBuilder()
        .setTitle("📜 Command List")
        .setColor("Aqua")
        .setDescription(`
**Meme Commands**
!meme !joke !roast  
**Troll**
!slap !cry !sus !simp !noob !pro !bonk  
**Fun Stats**
!gaymeter !simpmeter !coolrate !luck !iq  
**Random People**
!who_noob !who_pro !who_sus  
**Leaderboard**
!leaderboard
        `);
      message.channel.send({ embeds: [helpEmbed] });
    }

    if(cmd === "!meme") await sendAutoMeme(message.channel);
    if(cmd === "!joke") message.reply(jokes[Math.floor(Math.random()*jokes.length)]);
    if(cmd === "!roast") message.reply(roasts[Math.floor(Math.random()*roasts.length)]);

    // troll
    if(cmd === "!slap"){ updateLeaderboard(id,"noob"); message.reply(`${message.author} menampar seseorang 👋`); }
    if(cmd === "!cry"){ message.reply(`${message.author} menangis 😭`); }
    if(cmd === "!sus"){ updateLeaderboard(id,"noob"); message.reply(`${message.author} SUS 🤨`); }
    if(cmd === "!simp"){ updateLeaderboard(id,"simp"); message.reply(`${message.author} SIMP 🫡`); }
    if(cmd === "!noob"){ updateLeaderboard(id,"noob"); message.reply("Certified NOOB 🎮"); }
    if(cmd === "!pro"){ updateLeaderboard(id,"pro"); message.reply("Player PRO 😎"); }
    if(cmd === "!bonk"){ message.reply("Bonk horny jail 🔨"); }

    // stats
    if(cmd === "!gaymeter") message.reply(`🌈 Gay: ${Math.floor(Math.random()*1000)}%`);
    if(cmd === "!simpmeter") message.reply(`❤️ Simp: ${Math.floor(Math.random()*100)}%`);
    if(cmd === "!coolrate") message.reply(`😎 Coolness: ${Math.floor(Math.random()*100)}%`);
    if(cmd === "!luck") message.reply(`🍀 Luck: ${Math.floor(Math.random()*100)}%`);
    if(cmd === "!iq") message.reply(`🧠 IQ: ${Math.floor(Math.random()*500)}`);

    // leaderboard
    if(cmd === "!leaderboard") message.channel.send({ embeds: [createLeaderboardEmbed()] });

    // auto keywords
    for(const key in keywordsResponse){
      if(message.content.toLowerCase().includes(key))
        message.reply(keywordsResponse[key]);
    }
  },
  sendAutoMeme
};
