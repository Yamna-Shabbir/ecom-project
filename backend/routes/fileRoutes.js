const express = require("express");
const {
  openProductImageStream,
  isValidFileId,
} = require("../utils/productImages");

const router = express.Router();

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!isValidFileId(id)) {
    return res.status(400).json({ message: "Invalid image id" });
  }

  try {
    const stream = openProductImageStream(id);
    stream.on("file", (file) => {
      if (file.contentType) res.set("Content-Type", file.contentType);
      res.set("Cache-Control", "public, max-age=31536000, immutable");
    });
    stream.on("error", () => {
      if (!res.headersSent) res.status(404).json({ message: "Image not found" });
    });
    stream.pipe(res);
  } catch (err) {
    res.status(500).json({ message: "Could not load image" });
  }
});

module.exports = router;
