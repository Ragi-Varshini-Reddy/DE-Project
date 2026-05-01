const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const app = require("./app");
const { connectDb } = require("./config/db");

const rootEnv = path.resolve(process.cwd(), ".env");
const srcEnv = path.resolve(__dirname, ".env");

dotenv.config({ path: fs.existsSync(rootEnv) ? rootEnv : srcEnv });

const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error("Missing MONGODB_URI in environment");
  process.exit(1);
}

connectDb(mongoUri).then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});
