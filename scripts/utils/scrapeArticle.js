const cheerio = require("cheerio");
const axios = require("axios");
const moment = require("moment");
const { insertFingerprint, isFingerprintExists } = require("./setupSQLite.js");
const getRandomUA = require("./getRandomUA.js");
const generateFingerprint = require("./generateFingerprint.js");

/**
 * Scrapes article content from a given URL
 * Extracts title, content, publication date, and generates fingerprint
 * Performs duplicate checking and content validation
 *
 * @async
 * @param {string} url - The URL of the article to scrape
 * @returns {Promise<Object|null>} - Article data object or null if scraping failed/duplicate found
 */
async function scrapeArticle(url) {
  try {
    const res = await axios.get(url, {
      headers: { "User-Agent": getRandomUA() },
      timeout: 10000,
    });

    const $ = cheerio.load(res.data);
    const title = $("h1").first().text().trim() || $("title").text().trim();
    const content = $("p")
      .map((i, el) => $(el).text().trim())
      .get()
      .filter((p) => p.length > 50)
      .join("\n\n");

    const dateText =
      $('meta[property="article:published_time"]').attr("content") ||
      $("time").first().attr("datetime") ||
      $("time").first().text() ||
      $('meta[name="date"]').attr("content");

    const date = moment(dateText, moment.ISO_8601, true).isValid()
      ? moment(dateText).format("YYYY-MM-DD")
      : "Unknown";

    const fingerprint = generateFingerprint(title, content);
    if (!content || content.length < 50) {
      console.log(`⛔ Too short: ${url}`);
      return null;
    }
    if (isFingerprintExists.get(fingerprint)) {
      console.log(`🔁 Duplicate: ${url}`);
      return null;
    }

    insertFingerprint.run(fingerprint);

    return {
      mediaName: new URL(url).hostname.replace("www.", ""),
      date,
      title,
      content: content.substring(0, 5000),
      url,
    };
  } catch (err) {
    console.error(`❌ Error scraping ${url}: ${err.message}`);
    return null;
  }
}

module.exports = scrapeArticle;
