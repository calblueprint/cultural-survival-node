const { initializeApp } = require("firebase/app");
const { getFirestore, setDoc, doc } = require("firebase/firestore");
const { pullRecords } = require("./audioScraper");
require("dotenv").config();

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

async function setAudio() {
  const records = await pullRecords();
  for (const item of records) {
    if (!("Country" in item)) {
      item["Country"] = ["None"];
    }
    if (!("Language" in item)) {
      item["Language"] = ["None"];
    }
    console.log(item["SoundCloud Metadata"]["id"]);
    const audioRef = doc(db, "audio", item["SoundCloud Metadata"]["id"]);
    await setDoc(audioRef, {
      title: item["Title"][0],
      description: item["Description"][0],
      format: item["Format"][0],
      theme: item["Theme"][0],
      language: item["Language"][0],
      country: item["Country"][0],
      thumbnail: item["SoundCloud Metadata"]["thumbnail"],
      duration: item["SoundCloud Metadata"]["duration"],
      publishedAt: item["SoundCloud Metadata"]["publishedAt"],
      mp3filename: item["SoundCloud Metadata"]["mp3filename"],
    });
    console.log("finished pushing song metadata");
  }
  return "done";
}

async function main() {
  const yay = await setAudio();
  console.log(yay);
  return;
}

main();
