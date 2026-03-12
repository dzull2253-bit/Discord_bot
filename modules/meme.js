const { EmbedBuilder } = require("discord.js");
const axios = require("axios");

const subredditList = ["memes","dankmemes","funny","wholesomememes","ProgrammerHumor","gaming","anime","prequelmemes","HistoryMemes","me_irl"];
const giphyTags = ["funny","dance","hug","cry","meme","cat","dog","reaction"];

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
    return res.data.url;
  }catch(e){ console.error(e); return null; }
}

async function getGiphyRandom(tag){
  try{
    const res = await axios.get(`https://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=${tag}&rating=pg-13`);
    return res.data.data.images.original.url;
  }catch(e){ console.error(e); return null; }
}

async function sendAutoMeme(channel){
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

  const topNoob = Object.entries(leaderboard).sort((a,b)=>b[1].noob - a[1].noob).slice(0,5);
  embed.addFields({name:"Top 5 Noob", value:topNoob.map(([id,stats])=>`<@${id}> → ${stats.noob}`).join("\n") || "Belum ada data"});

  const topSimp = Object.entries(leaderboard).sort((a,b)=>b[1].simp - a[1].simp).slice(0,5);
  embed.addFields({name:"Top 5 Simp", value:topSimp.map(([id,stats])=>`<@${id}> → ${stats.simp}`).join("\n") || "Belum ada data"});

  const topPro = Object.entries(leaderboard).sort((a,b)=>b[1].pro - a[1].pro).slice(0,5);
  embed.addFields({name:"Top 5 Pro", value:topPro.map(([id,stats])=>`<@${id}> → ${stats.pro}`).join("\n") || "Belum ada data"});

  return embed;
}

module.exports = {
  handleMessage: async function(message){
    if(message.author.bot) return;
    const cmd = message.content.toLowerCase();
    const memberId = message.author.id;

    if(cmd === "!help"){
      message.channel.send({embeds:[new EmbedBuilder()
        .setTitle("📜 Command List")
        .setColor("#00FFFF")
        .setDescription(`
!meme, !joke, !roast
!slap, !cry, !sus, !simp, !noob, !pro, !bonk
!gaymeter, !simpmeter, !coolrate, !luck, !iq
!who_noob, !who_pro, !who_sus
!leaderboard
!dance, !hug, !cry
!8ball
!play, !skip, !stop (music)
`)]});
    }

    if(cmd === "!meme") await sendAutoMeme(message.channel);
    if(cmd === "!joke") message.reply(jokes[Math.floor(Math.random()*jokes.length)]);
    if(cmd === "!roast") message.reply(roasts[Math.floor(Math.random()*roasts.length)]);

    // troll commands
    if(cmd === "!slap"){ updateLeaderboard(memberId,"noob"); message.reply(`${message.author} menampar seseorang 👋`); }
    if(cmd === "!cry"){ message.reply(`${message.author} menangis di pojok 😭`); }
    if(cmd === "!sus"){ updateLeaderboard(memberId,"noob"); message.reply(`${message.author} terlihat sangat SUS 🤨`); }
    if(cmd === "!simp"){ updateLeaderboard(memberId,"simp"); message.reply(`${message.author} adalah SIMP tingkat dewa 🫡`); }
    if(cmd === "!noob"){ updateLeaderboard(memberId,"noob"); message.reply(`${message.author} certified NOOB 🎮`); }
    if(cmd === "!pro"){ updateLeaderboard(memberId,"pro"); message.reply(`${message.author} pemain PRO 😎`); }
    if(cmd === "!bonk"){ message.reply(`${message.author} kena bonk horny jail 🔨`); }

    // fun stats
    if(cmd === "!gaymeter") message.reply(`🌈 Gay meter: ${Math.floor(Math.random()*100)}%`);
    if(cmd === "!simpmeter") message.reply(`❤️ Simp meter: ${Math.floor(Math.random()*100)}%`);
    if(cmd === "!coolrate") message.reply(`😎 Coolness kamu: ${Math.floor(Math.random()*100)}%`);
    if(cmd === "!luck") message.reply(`🍀 Luck hari ini: ${Math.floor(Math.random()*100)}%`);
    if(cmd === "!iq") message.reply(`🧠 IQ kamu: ${Math.floor(Math.random()*200)}`);

    // leaderboard
    if(cmd === "!leaderboard") message.channel.send({embeds:[createLeaderboardEmbed()]});

    // keywords
    for(const [key,res] of Object.entries(keywordsResponse)){
      if(message.content.toLowerCase().includes(key)) message.reply(res);
    }
  },
  sendAutoMeme
};
