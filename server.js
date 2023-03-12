const { Storage } = require("@google-cloud/storage");
const storage = new Storage({ keyFilename: "./serviceAccountKey.json" });
const bucketName = "cultural-survival-mobile.appspot.com";

async function pushAudio(filename) {
  await storage.bucket(bucketName).upload(filename);
  console.log("Pushed audio to Firebase Storage.");
}

async function getGcsLink(filename) {
  const [metadata] = await storage
    .bucket(bucketName)
    .file(filename)
    .getMetadata();
  return metadata.mediaLink;
}

module.exports = {
  pushAudio,
  getGcsLink,
};
