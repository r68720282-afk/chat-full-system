// backend/src/utils/gridfs.js
const mongoose = require("mongoose");
const Grid = require("gridfs-stream");

let gfs, gridfsBucket;

mongoose.connection.once("open", () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "uploads"
  });
  gfs = Grid(mongoose.connection.db, mongoose.mongo);
  gfs.collection("uploads");
  console.log("GridFS initialized");
});

function uploadFile(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: "no_file" });

    res.json({
      ok: true,
      fileId: req.file.id,
      filename: req.file.filename,
      contentType: req.file.contentType
    });
  } catch (err) {
    console.error("uploadFile:", err);
    res.status(500).json({ error: "server_error" });
  }
}

function getFile(req, res) {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);

    gridfsBucket.openDownloadStream(id).pipe(res);
  } catch (err) {
    console.error("getFile:", err);
    res.status(500).json({ error: "server_error" });
  }
}

module.exports = { uploadFile, getFile, gfs };
