const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const sharp = require("sharp");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
const upload = multer({ dest: "uploads/" });

app.post("/remove-bg", upload.single("image"), async (req, res) => {
  const inputPath = req.file.path;
  const outputPath = `uploads/removed-${Date.now()}.png`;

  try {
    const response = await axios({
      method: "post",
      url: "https://api.remove.bg/v1.0/removebg",
      data: {
        image_file: fs.createReadStream(inputPath),
        size: "auto",
      },
      headers: {
        "X-Api-Key": process.env.REMOVE_BG_API_KEY,
      },
    });

    fs.writeFileSync(outputPath, response.data);

    res.sendFile(outputPath, () => {
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Background removal failed" });
  }
});

app.listen(5000, () => console.log("Backend running on http://localhost:5000"));
