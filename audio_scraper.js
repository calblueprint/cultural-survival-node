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
  let audioURLArray = [];
  var data = await xmlToJson(
    "https://rights.culturalsurvival.org/blueprint-xml"
  );
  let newData = data.radio_spots.radio_spot;
  newData.map((item) => {
    audioURLArray.push(item.SoundCloud[0]);
  });
  audioURLArray.forEach((url, index) => {
    audioURLArray[index] = cleanUrl(url);
  });
  let records = [];
  // // FIXME: truncating audioURLArray for testing purposes
  let testURLs = audioURLArray.slice(0, 6);
  console.log(testURLs);
  for (const url of testURLs) {
    let record = await getAudioInfo(url);
    records.push(record);
  }
  return records;
};

const cleanUrl = (url) => {
  let newUrl = url.split("?");
  return newUrl[0];
};

const cleanSongTitle = (songTitle) => {
  // let newSongTitle = songTitle.replace("?", " ");
  let newSongTitle = songTitle.replace(/[^a-z0-9]/gi, "");
  return newSongTitle;
};

const getAudioInfo = async (url) => {
  const client = new SoundCloud.Client();
  let song = await client.getSongInfo(url);

  const stream = await song.downloadProgressive();
  const writer = stream.pipe(
    fs.createWriteStream(`./audio/${cleanSongTitle(song.title)}.mp3`)
  );
  let filename = song.title;
  writer.on("finish", () => {
    console.log("Finished writing song!");
  });

  // const client = new SoundCloud.Client();
  // let song = await client.getSongInfo(url);
  // client
  //   .getSongInfo(url)
  //   .then(async (song) => {
  //     const stream = await song.downloadProgressive();
  //     const writer = stream.pipe(
  //       fs.createWriteStream(`./audio/${cleanSongTitle(song.title)}.mp3`)
  //     );
  //     writer.on("finish", () => {
  //       console.log("Finished writing song!");
  //       process.exit(1);
  //     });
  //   })
  //   .catch(console.error);

  let record = {
    title: song["title"],
    description: song["description"],
    thumbnail: song["thumbnail"],
    url: song["url"],
    duration: song["duration"],
    genre: song["genre"],
    author: song["author"],
    publishedAt: song["publishedAt"],
    trackURL: song["trackURL"],
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

/* Download audio files locally. */
pullRecords();
