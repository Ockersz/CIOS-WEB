import { initializeDatabase } from "./db.js";

initializeDatabase()
  .then(() => {
    console.log("Database initialized and seed applied if needed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to seed database", error);
    process.exit(1);
  });
