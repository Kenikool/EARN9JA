import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import seedEnhancedData from "./src/utils/seedDataEnhanced.js";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the .env file in the server directory
dotenv.config({ path: join(__dirname, ".env") });

console.log("🚀 Starting Recipe App Database Seeding...\n");

seedEnhancedData();
