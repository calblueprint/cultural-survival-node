const SoundCloud = require("soundcloud-scraper");
var parseString = require("xml2js").parseString;
var http = require("https");

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
  console.log(audioURLArray);
  let records = [];
  for (const url of audioURLArray) {
    let record = await getAudioInfo(url);
    records.push(record);
  }
  return records;
};

const cleanUrl = (url) => {
  let newUrl = url.split("?");
  return newUrl[0];
};

const getAudioInfo = async (url) => {
  const client = new SoundCloud.Client();
  let song = await client.getSongInfo(url);
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
  };
  return record;
};

module.exports = {
  xmlToJson,
  pullRecords,
  cleanUrl,
  getAudioInfo,
};
