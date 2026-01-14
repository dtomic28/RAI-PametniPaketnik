const fs = require("fs/promises");
const path = require("path");
const imageProcessor = require("../utils/imageProcessor");

async function getImage(req, res) {
    try {
        const filename = req.params.file;
        const filePath = path.join(__dirname, "..", "images", filename);

        const ext = path.extname(filename).toLowerCase();

        if (ext === ".bin") {
            const compressed = await fs.readFile(filePath);
            const decompressed = await imageProcessor.decompressBuffer(compressed);
            res.set("Content-Type", "image/jpeg");
            return res.send(decompressed);
        }

        // backward compatibility for .png and .jpg files
        const buffer = await fs.readFile(filePath);
        const mime = ext === ".png" ? "image/png" : "image/jpeg";
        res.set("Content-Type", mime);
        return res.send(buffer);
    } catch (err) {
        console.error("getImage error:", err.message);
        return res.status(404).send("Not found");
    }
}

async function postImage(req, res) {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const compressed = await imageProcessor.compressBuffer(req.file.buffer);

        const uniqueName = `img_${Date.now()}_${Math.floor(Math.random() * 10000)}.bin`;
        const outPath = path.join(__dirname, "..", "images", uniqueName);
        await fs.writeFile(outPath, compressed);

        return res.status(200).json({ filePath: `images/${uniqueName}` });
    } catch (err) {
        console.error("postImage error:", err);
        return res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getImage,
    postImage,
};