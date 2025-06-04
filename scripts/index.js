const { exit } = require("process");

// Import configuration settings
const config = require("../config.js");

// Import utility functions
const { db } = require("./utils/setupSQLite.js");
const generateMonthlyRanges = require("./utils/generateMonthlyRanges.js");
const searchGoogleNews = require("./utils/searchGoogleNews.js");
const exportDbToExcel = require("./utils/exportDbToExcel.js");

/**
 * Main function that orchestrates the entire news harvesting process
 * Generates date ranges, runs searches for each term, and exports results
 *
 * @async
 * @returns {Promise<void>}
 */
async function main() {
  const dateRanges = generateMonthlyRanges(config.yearsToSearch);

  for (const term of config.searchTerms) {
    for (const dateRange of dateRanges) {
      await searchGoogleNews(term, dateRange);
    }
  }

  exportDbToExcel();
  console.log("✅ All tasks complete.");
  db.close();
}

// Initialize the application with error handling
main().catch((err) => {
  console.error("❌ Fatal error:", err.message);
  db.close();
  exit(1);
});
