const { MongoClient } = require("mongodb");
const mongodb = require("mongodb");
var index = require("./audio_scraper");
const fs = require("fs");

async function main() {
  /**
   * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
   * See https://docs.mongodb.com/drivers/node/ for more details
   */
  const uri =
    "mongodb+srv://akshaynthakur:E6M7HWjK@atlascluster.iqjceju.mongodb.net/?retryWrites=true&w=majority";

  /**
   * The Mongo Client you will use to interact with your database
   * See https://mongodb.github.io/node-mongodb-native/3.6/api/MongoClient.html for more details
   * In case: '[MONGODB DRIVER] Warning: Current Server Discovery and Monitoring engine is deprecated...'
   * pass option { useUnifiedTopology: true } to the MongoClient constructor.
   * const client =  new MongoClient(uri, {useUnifiedTopology: true})
   */
  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB cluster
    await client.connect();

    // Make the appropriate DB calls
    let records = await index.pullRecords();

    for (const record of records) {
      await createAudio(client, record);
    }
  } finally {
    // Close the connection to the MongoDB cluster
    await client.close();
  }
}

main().catch(console.error);

// Add functions that make DB calls here

// async function createAudio(client, newAudio) {
//   const result = await client
//     .db("cultural-survival-mobile")
//     .collection("audio")
//     .insertOne(newAudio);
//   console.log(
//     `New listing created with the following id: ${result.insertedId}`
//   );
// }

async function createAudio(client, metadata_insert) {
  const db = client.db("cultural-survival-mobile");
  const bucket = new mongodb.GridFSBucket(db, { bucketName: "audio" });

  //uploading files
  let filename = metadata_insert["mp3filename"];
  fs.createReadStream(`./audio/${filename}.mp3`).pipe(
    bucket.openUploadStream(`${filename}.mp3`, {
      chunkSizeBytes: 1048576,
      metadata: metadata_insert,
    })
  );
}
