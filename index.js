const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const { on } = require("process");
const app = express();

//Middleware
app.use(bodyParser.json());

//Init gfs
let gfs;

mongoose.connect("mongodb+srv://file:file@cluster0.kpvqg.mongodb.net/file-upload?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});
const conn = mongoose.connection;
conn.once("open", () => {
    console.log("Connected to db");
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("uploads");
});

//Create storage engine
const storage = new GridFsStorage({
    url: "mongodb+srv://file:file@cluster0.kpvqg.mongodb.net/file-upload?retryWrites=true&w=majority",
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if(err){
                    return reject(err);
                }
                const filename = buf.toString("hex") + path.extname(file.originalname)
                const fileInfo = {
                    filename: filename,
                    bucketName: "uploads"
                };
                resolve(fileInfo);
            });
        });
    }
});

const upload = multer({storage});
// const upload = multer({
//     dest: "./uploads/"
// });

app.post("/upload", upload.single("file"), (req, res) => {
    console.log(req.file)
    console.log(req.body)
    res.json({file: req.file});
});

app.listen(3344, function(){
    console.log("Running on port 3344")
});