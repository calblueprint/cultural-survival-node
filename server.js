var admin = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");
const { Storage } = require('@google-cloud/storage');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "cultural-survival-mobile.appspot.com",
});

var bucket = admin.storage().bucket();

// var myFile =
//   // "./audio/El ritual de Día de Muertos en Ayutla de los Libres, México.mp3";
//   "./audio/Coalición SIRGE, spot 3 - Por una transición energética justa.mp3";
// bucket.upload(myFile, function (err, file) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("uploaded audio!");
//   }
// });


 const bucketName = 'cultural-survival-mobile.appspot.com';
 const fileName = 'Coalición SIRGE, spot 3 - Por una transición energética justa.mp3';


// Creates a client
const storage = new Storage({keyFilename: './serviceAccountKey.json'});

async function getMetadata() {
  // Gets the metadata for the file
  const [metadata] = await storage
    .bucket(bucketName)
    .file(fileName)
    .getMetadata();
  
  console.log(`Id: ${metadata.id}`);
}

getMetadata().catch(console.error);
//using metadata function, we access each file ID and get the mp3 download with:

// https://storage.cloud.google.com + metadata ID value ending with .mp3 (need to truncate)

















