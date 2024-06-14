const dotenv = require('dotenv');
dotenv.config();

const TelegramBot = require("node-telegram-bot-api");
const dt = require("downloadTiktok")

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

async function downloadTt(url, msg) {
  const result = await dt.downloadTiktok(url)
  const poppedResult = result.medias.pop();
  if (result.duration != 0) {
    bot.sendVideo(msg.chat.id, result.medias[1].url, { caption: `Sent by ${msg.from.username}` });
  }
  else {
    bot.sendMediaGroup(msg.chat.id,
      result.medias.map((e) => {
        return { type: 'photo', "media": e.url, caption: result.medias[0] == e ? `Sent by ${msg.from.username}` : "" }
      }))
      .then(
        () => {
          bot.sendAudio(msg.chat.id, poppedResult.url);
        });
  }
  bot.deleteMessage(msg.chat.id, msg.message_id)
    .then(() => {
      console.log(`Message ${msg.message_id} deleted successfully`);
    })
    .catch((err) => {
      console.error('Error deleting message:', err);
    });
}
function downloadInsta(url, msg) {
  instagramDl(url)
    .then((results) => {
      bot.sendMediaGroup(msg.chat.id, results.map((e) => { return { type: "video", "media": e.download_link }; }));
    })
    .catch((err) => {
      console.log(err);
    });
}
