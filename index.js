const dotenv = require('dotenv');
dotenv.config();

const TelegramBot = require("node-telegram-bot-api");
const TikChan = require("tikchan");

const token = process.env["BOT_TOKEN"];
const instagramDl = require("@sasmeee/igdl");

const bot = new TelegramBot(token, { polling: true });
const dateStart = Date.now();

const tiktokURLregx = /https?:\/\/?vm.tiktok.com\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g
const instaURLregx = /https?:\/\/?www.instagram.com\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g

console.log(`Bot started at ${dateStart}`);

bot.on("message", (msg) => {
  if (msg.date * 1000 > dateStart) {
    let linksArrayTt = msg.text?.match(tiktokURLregx);
    linksArrayTt && linksArrayTt.forEach(url => downloadTt(url, msg))
    let linksArrayInst = msg.text?.match(instaURLregx);
    linksArrayInst && linksArrayInst.forEach(url => downloadInsta(url, msg))
  } else {
    console.log(`Message was at ${msg.date}, but bot started at ${dateStart}`);
  }
});

function downloadTt(url, msg) {
  TikChan.download(url)
    .then((results) => {
      results["no_wm"] && 
      bot.sendVideo(msg.chat.id, results["no_wm"]);
    })
    .catch((err) => {
      console.log(err);
    });
}
function downloadInsta(url, msg) {
  instagramDl(url)
  .then((results) => {
    bot.sendMediaGroup(msg.chat.id, results.map((e) => { return {type: "video", "media" : e.download_link}; }));
  })
  .catch((err) => {
    console.log(err);
  });
}