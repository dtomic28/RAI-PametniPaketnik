const mongoose = require("mongoose");

// Required env vars
const requiredVars = [
  "MONGO_USER",
  "MONGO_PASS",
  "MONGO_DB",
  "MONGO_URI_TEMPLATE",
  "JWT_SECRET",
  "ORV_API_LINK",
];
const missing = requiredVars.filter((name) => !process.env[name]);

if (missing.length > 0) {
  console.error(
    `❌ Missing required environment variables: ${missing.join(", ")}`
  );
  process.exit(1); // Exit the app
}

// Prepare connection string
const user = encodeURIComponent(process.env.MONGO_USER);
const pass = encodeURIComponent(process.env.MONGO_PASS);
const dbName = process.env.MONGO_DB;
const uriTemplate = process.env.MONGO_URI_TEMPLATE;

const mongoURI = uriTemplate
  .replace("{user}", user)
  .replace("{password}", pass);

mongoose.connect(mongoURI, {
  dbName: dbName,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.Promise = global.Promise;

const db = mongoose.connection;

db.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err.message);
});

db.once("open", () => {
  console.log("✅ MongoDB connection successful.");
});

module.exports = { db, mongoURI };
