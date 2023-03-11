var admin = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "cultural-survival-mobile.appspot.com",
});

var bucket = admin.storage().bucket();

var myFile =
  // "./audio/El ritual de Día de Muertos en Ayutla de los Libres, México.mp3";
  "./audio/Coalición SIRGE, spot 3 - Por una transición energética justa.mp3";

bucket.upload(myFile, function (err, file) {
  if (err) {
    console.log(err);
  } else {
    console.log("uploaded audio!");
  }
});