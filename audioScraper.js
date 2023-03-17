const SoundCloud = require("soundcloud-scraper");
var parseString = require("xml2js").parseString;
var http = require("https");
const fs = require("fs");

/* Takes an RSS feed url and returns JSON object. */
const xmlToJson = (url) => {
  return new Promise((resolve, reject) => {
    var req = http.get(url, function (res) {
      var xml = "";

      res.on("data", function (chunk) {
        xml += chunk;
      });

      res.on("error", function (e) {
        reject(e);
      });

      res.on("timeout", function (e) {
        reject(e);
      });

      res.on("end", function () {
        parseString(xml, function (err, result) {
          resolve(result);
        });
      });
    });
  });
};

/* Calls helper functions to locally download mp3s and returns associated metadata. */
const pullRecords = async () => {
  var data = await xmlToJson(
    "https://rights.culturalsurvival.org/blueprint-xml"
  );
  let newData = data.radio_spots.radio_spot;
  for (const item of newData) {
    item["SoundCloudCleaned"] = [cleanUrl(item["SoundCloud"][0])];
  }
  for (const item of newData) {
    item["SoundCloud Metadata"] = await getAudioInfo(
      item["SoundCloudCleaned"][0]
    );
  }
  return newData;
};

/* Removes excess characters from URL. */
const cleanUrl = (url) => {
  let newUrl = url.split("?");
  return newUrl[0];
};

/* Normalizes song title string to fit Windows filepath requirements. */
const cleanSongTitle = (songTitle) => {
  let newSongTitle = songTitle.replace(/[^a-z0-9]/gi, "");
  return newSongTitle;
};

/* Takes SoundCloud URL, downloads mp3 locally, and returns all relevant metadata. */
const getAudioInfo = async (url) => {
  const client = new SoundCloud.Client();
  let song = await client.getSongInfo(url);
  const stream = await song.downloadProgressive();
  const writer = stream.pipe(
    fs.createWriteStream(`./audio/${cleanSongTitle(song.title)}.mp3`)
  );
  let filename = cleanSongTitle(song.title);
  writer.on("finish", () => {
    console.log("Downloaded audio locally.");
  });
  let record = {
    id: song["id"],
    title: song["title"],
    thumbnail: song["thumbnail"],
    duration: song["duration"],
    publishedAt: song["publishedAt"],
    mp3filename: filename + ".mp3",
  };
  return record;
};

module.exports = {
  xmlToJson,
  pullRecords,
  cleanUrl,
  getAudioInfo,
};
