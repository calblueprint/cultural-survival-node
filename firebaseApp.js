const { initializeApp } = require("firebase/app");
const { getFirestore, setDoc, doc } = require("firebase/firestore");
const { pullRecords } = require("./audioScraper");
const { getGcsLink, pushAudio } = require("./server");
require("dotenv").config();
const fsExtra = require("fs-extra");

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

function stringCleanup(item, string) {
  if (string in item) {
    var arr = item[string][0].split(", ");
    if (string == "Country") {
      arr = arr.filter(
        (elem) =>
          elem !== "Plurinational State of" && elem !== "Bolivarian Republic of"
      );
    }
    return arr;
  } else {
    return ["None"];
  }
}

async function setAudio() {
  const records = await pullRecords();
  for (const item of records) {
    await pushAudio("./audio/" + item["SoundCloud Metadata"]["mp3filename"]);
    const pulledLink = await getGcsLink(
      item["SoundCloud Metadata"]["mp3filename"]
    );
    item["Theme"] = [stringCleanup(item, "Theme")];
    item["Language"] = [stringCleanup(item, "Language")];
    item["Indigenous-Languages"] = [
      stringCleanup(item, "Indigenous-Languages"),
    ];
    item["Country"] = [stringCleanup(item, "Country")];
    const audioRef = doc(db, "audio", item["SoundCloud Metadata"]["id"]);
    await setDoc(audioRef, {
      title: item["Title"][0],
      description: item["Description"][0],
      format: item["Format"][0],
      theme: item["Theme"][0],
      language: item["Language"][0],
      indigenousLanguage: item["Indigenous-Languages"][0],
      country: item["Country"][0],
      xmlSoundCloud: item["SoundCloud"][0],
      thumbnail: item["SoundCloud Metadata"]["thumbnail"],
      duration: item["SoundCloud Metadata"]["duration"],
      publishedAt: item["SoundCloud Metadata"]["publishedAt"],
      mp3filename: item["SoundCloud Metadata"]["mp3filename"],
      gcsLink: pulledLink,
    });
    console.log("Pushed audio metadata to Firestore.");
  }
  fsExtra.emptyDirSync("./audio");
  return "Done.";
}

async function main() {
  const yay = await setAudio();
  console.log(yay);
  return;
}

main();
