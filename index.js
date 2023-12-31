const dotenv = require('dotenv');
dotenv.config();

const TelegramBot = require("node-telegram-bot-api");
const TikChan = require("tikchan");

const token = process.env["BOT_TOKEN"];

const bot = new TelegramBot(token, { polling: true });
const dateStart = Date.now();

const tiktokURLregx = /https?:\/\/?vm.tiktok.com\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g

console.log(`Bot started at ${dateStart}`);

bot.on("message", (msg) => {
  if (msg.date * 1000 > dateStart) {
    let linksArray = msg.text?.match(tiktokURLregx);
    linksArray && linksArray.forEach(url => download(url, msg))
  } else {
    console.log(`Message was at ${msg.date}, but bot started at ${dateStart}`);
  }
});

function download(url, msg) {
  TikChan.download(url)
    .then((results) => {
      results["no_wm"] && 
      bot.sendVideo(msg.chat.id, results["no_wm"], { disable_notification: true, reply_to_message_id : msg.message_id, allow_sending_without_reply : true });
    })
    .catch((err) => {
      console.log(err);
    });
}
