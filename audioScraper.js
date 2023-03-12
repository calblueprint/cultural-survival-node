const SoundCloud = require("soundcloud-scraper");
var parseString = require("xml2js").parseString;
var http = require("https");
const fs = require("fs");

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

const pullRecords = async () => {
  var data = await xmlToJson(
    "https://rights.culturalsurvival.org/blueprint-xml"
  );
  let newData = data.radio_spots.radio_spot;
  for (const item of newData) {
    item["SoundCloud"][0] = cleanUrl(item["SoundCloud"][0]);
  }
  // // FIXME: truncating audioURLArray for testing purposes
  let testData = newData.slice(0, 6);
  for (const item of testData) {
    item["SoundCloud Metadata"] = await getAudioInfo(item["SoundCloud"][0]);
  }
  // console.log(testData);
  return testData;
};

const cleanUrl = (url) => {
  let newUrl = url.split("?");
  return newUrl[0];
};

const cleanSongTitle = (songTitle) => {
  let newSongTitle = songTitle.replace(/[^a-z0-9]/gi, "");
  return newSongTitle;
};

const getAudioInfo = async (url) => {
  const client = new SoundCloud.Client();
  let song = await client.getSongInfo(url);
  // console.log(song);
  const stream = await song.downloadProgressive();
  const writer = stream.pipe(
    fs.createWriteStream(`./audio/${cleanSongTitle(song.title)}.mp3`)
  );
  let filename = cleanSongTitle(song.title);
  writer.on("finish", () => {
    console.log("Finished writing song!");
  });
  // console.log(song);
  let record = {
    id: song["id"],
    title: song["title"],
    // description: song["description"],
    thumbnail: song["thumbnail"],
    // url: song["url"],
    duration: song["duration"],
    // genre: song["genre"],
    // author: song["author"],
    publishedAt: song["publishedAt"],
    // trackURL: song["trackURL"],
    mp3filename: filename,
  };
  return record;
};

module.exports = {
  xmlToJson,
  pullRecords,
  cleanUrl,
  getAudioInfo,
};

// /* Download audio files locally. */
// pullRecords();

// Metadata from XML feed:
// Description, Country, Format, Theme, Language
