/**
 * @file config.js
 * @fileoverview Configuration module for the news harvester application
 * @description Contains settings for search terms, date ranges, output files, and request delays
 */

// === Configuration Settings ===

/**
 * * List of search terms to query in Google News
 * * Each term will be searched separately
 * * More terms will result in more data but also longer execution time
 * * Ensure terms are relevant to your research or interests
 * * You can add or remove terms as needed
 * @type {string[]}
 */
const SEARCH_TERMS = ["climate change", "AI in education"];

/**
 * * Number of years to look back in the search
 * * Higher values will result in more data but longer execution time
 * @type {number}
 */
const YEARS_TO_SEARCH = 2;

/**
 * * Number of pages to retrieve per search term and date range
 * * Each page typically contains about 10 results
 * @type {number}
 */
const PAGES_PER_TERM = 5;

/**
 * * Name of the Excel file where results will be saved
 * * File will be created in the `data/` directory
 * @type {string}
 */
const OUTPUT_FILE = "news_output.xlsx";

/**
 * * Name of the SQLite database file for storing articles
 * * Used for deduplication and as a data source for Excel export
 * * File will be created in the `data/` directory
 * @type {string}
 */
const DB_FILE = "news_harvester.db";

/**
 * * Delay in milliseconds between requests to avoid rate limiting
 * * Increase this value if you encounter CAPTCHA or blocking issues
 * @type {number}
 */
const DELAY_BETWEEN_REQUESTS = 2000;

/**
 * @module config
 * @description Configuration module for the news harvester application
 * @exports {Object} config - Configuration object containing all settings
 * @property {string[]} config.searchTerms - Array of search terms to query
 * @property {number} config.yearsToSearch - Number of years to look back in search
 * @property {number} config.pagesPerTerm - Number of pages to retrieve per search term
 * @property {string} config.outputFile - Name of Excel output file
 * @property {string} config.dbFile - Name of SQLite database file
 * @property {number} config.delayBetweenRequests - Delay in milliseconds between API requests
 */
const config = {
  searchTerms: SEARCH_TERMS,
  yearsToSearch: YEARS_TO_SEARCH,
  pagesPerTerm: PAGES_PER_TERM,
  outputFile: OUTPUT_FILE,
  dbFile: DB_FILE,
  delayBetweenRequests: DELAY_BETWEEN_REQUESTS,
};

module.exports = config;
