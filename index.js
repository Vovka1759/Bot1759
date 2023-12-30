const TelegramBot = require("node-telegram-bot-api");
const TikChan = require("tikchan");

const token = process.env["BOT_TOKEN"];

const bot = new TelegramBot(token, { polling: true });
const dateStart = Date.now();

console.log(`Bot started at ${dateStart}`);

bot.on("message", (msg) => {
  console.log(msg);
  if (msg.date * 1000 > dateStart) {
    download(msg);
  } else {
    console.log(`Message was at ${msg.date}, but bot started at ${dateStart}`);
  }
});

function download(msg) {
  TikChan.download(msg.text)
    .then((results) => {
      bot.sendVideo(msg.chat.id, results["no_wm"]);
    })
    .catch((err) => {
      console.log(err);
    });
}
