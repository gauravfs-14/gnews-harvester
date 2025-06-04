const puppeteer = require("puppeteer-extra");
const { insertArticle } = require("./setupSQLite.js");
const getRandomUA = require("./getRandomUA.js");
const config = require("../../config.js");
const scrapeArticle = require("./scrapeArticle.js");

// Apply stealth plugin to avoid detection
puppeteer.use(require("puppeteer-extra-plugin-stealth")());

/**
 * Searches Google News for articles based on search term and date range
 *
 * @async
 * @param {string} searchTerm - The search term to query Google News with
 * @param {Object} dateRange - Date range object with startDate and endDate properties
 * @returns {Promise<void>} - Promise that resolves when search is complete
 */
async function searchGoogleNews(searchTerm, dateRange) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setUserAgent(getRandomUA());

  for (let i = 0; i < config.pagesPerTerm; i++) {
    const start = i * 10;
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
      searchTerm
    )}&tbm=nws&tbs=cdr:1,cd_min:${dateRange.startDate},cd_max:${
      dateRange.endDate
    }&start=${start}`;

    console.log(
      `🔍 [${searchTerm}] ${dateRange.startDate} → ${
        dateRange.endDate
      } | Page ${i + 1}`
    );
    await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });

    if (page.url().includes("/sorry/")) {
      console.warn("⚠️ CAPTCHA detected. Waiting 15s...");
      await new Promise((res) => setTimeout(res, 15000));
      continue;
    }

    await page.mouse.move(100 + Math.random() * 300, 200 + Math.random() * 100);
    await new Promise((res) => setTimeout(res, 500 + Math.random() * 1500));
    await page.evaluate(() => window.scrollBy(0, 300 + Math.random() * 300));

    const links = await page.evaluate(() =>
      Array.from(document.querySelectorAll("div[data-news-cluster-id] a[href]"))
        .map((a) => a.href)
        .filter((href) => href.startsWith("http"))
    );

    if (links.length === 0) {
      console.warn("🚨 No links found — possible DOM change.");
    } else {
      console.log(`🔗 Found ${links.length} links`);
    }

    for (const url of links) {
      const article = await scrapeArticle(url);
      if (article) {
        insertArticle.run(
          article.mediaName,
          article.date,
          article.title,
          article.content,
          article.url
        );
        console.log(`✅ Saved: ${article.title.slice(0, 60)}...`);
      }
      await new Promise((res) => setTimeout(res, config.delayBetweenRequests));
    }
  }

  await browser.close();
}

module.exports = searchGoogleNews;
