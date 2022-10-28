const express = require("express")
const SoundCloud = require("soundcloud-scraper");

const app = express()

const client = new SoundCloud.Client();
const fs = require("fs");

client.getSongInfo("https://soundcloud.com/culturalsurvival/dia-de-la-resistencia-indigena")
    .then(async song => {
        const stream = await song.downloadProgressive();
        const writer = stream.pipe(fs.createWriteStream(`./audio/${song.title}.mp3`));
        writer.on("finish", () => {
          console.log("Finished writing song!")
          process.exit(1);
        });
    })
    .catch(console.error);

app.get("/", (req, res) => {
    res.send("First request");
});

app.listen(3000, () => {
    console.log("Listening");
})