const express = require("express");
const SoundCloud = require("soundcloud-scraper");
const { parse } = require("rss-to-json");
var parseString = require("xml2js").parseString;
var http = require("https");

const app = express();

const client = new SoundCloud.Client();
const fs = require("fs");

// rss feed parser

const xmlToJson = (url, callback) => {
  var req = http.get(url, function (res) {
    var xml = "";

    res.on("data", function (chunk) {
      xml += chunk;
    });

    res.on("error", function (e) {
      callback(e, null);
    });

    res.on("timeout", function (e) {
      callback(e, null);
    });

    res.on("end", function () {
      parseString(xml, function (err, result) {
        callback(null, result);
      });
    });
  });
};

const readJsonPromise = (url) => {
  return new Promise((resolve, reject) => {
    xmlToJson(url, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
};

const getJson = () => {
  readJsonPromise("https://rights.culturalsurvival.org/blueprint-xml")
    .then((data) => {
      /* Do something with data */
      var result = JSON.stringify(data);
      console.log(result);
      return result;
      // fs.writeFile("test.json", JSON.stringify(data), "utf8", function (err) {
      //   if (err) {
      //     console.log("An error occured while writing JSON Object to File.");
      //     return console.log(err);
      //   }
      // });
    })
    .catch((err) => {
      /* Handle error */
    });
};

const getUrls = () => {
  var json = getJson();
  console.log(json);
};

getUrls();
// soundcloud scraper

const getTrack = (url) => {
  client
    .getSongInfo(url)
    .then(async (song) => {
      const stream = await song.downloadProgressive();
      const writer = stream.pipe(
        fs.createWriteStream(`./audio/${song.title}.mp3`)
      );
      writer.on("finish", () => {
        console.log("Finished writing song!");
        process.exit(1);
      });
    })
    .catch(console.error);
};

const getTracks = (urls) => {
  urls.forEach((url) => getTrack(url));
};

// app.get("/", (req, res) => {
//   res.send("First request");
// });

// app.listen(3000, () => {
//   console.log("Listening");
// });
