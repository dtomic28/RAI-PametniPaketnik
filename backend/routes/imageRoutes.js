const express = require("express");
const imageController = require("../controllers/imageController");

const router = express.Router();

const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
});


router.get("/:file", imageController.getImage);
router.post("/", upload.single("image"), imageController.postImage);

module.exports = router;
