const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");
require("dotenv").config();

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());

app.post("/remove-bg", upload.single("image"), async (req, res) => {
  const inputPath = req.file.path;

  try {
    const response = await axios({
      method: "post",
      url: "https://api.remove.bg/v1.0/removebg",
      data: fs.createReadStream(inputPath),
      headers: {
        "X-Api-Key": process.env.REMOVE_BG_API_KEY,
        ...req.file.headers,
      },
      responseType: "arraybuffer",
    });

    fs.unlinkSync(inputPath);
    res.set("Content-Type", "image/png");
    res.send(response.data);
  } catch (error) {
    fs.unlinkSync(inputPath);
    res.status(500).json({ error: "Background removal failed" });
  }
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
