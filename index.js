const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const axios = require("axios");
const cheerio = require("cheerio");
const Database = require("better-sqlite3");
const moment = require("moment");
const XLSX = require("xlsx");
const fs = require("fs");
const { exit } = require("process");

puppeteer.use(StealthPlugin());

const config = {
  searchTerms: ["climate change", "AI in education"],
  yearsToSearch: 2,
  pagesPerTerm: 5,
  outputFile: "news_output.xlsx",
  dbFile: "news_harvester.db",
  delayBetweenRequests: 2000,
};

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; rv:124.0) Gecko/20100101 Firefox/124.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.105 Safari/537.36",
  "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0",
];

function getRandomUA() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// === SQLite DB Setup ===
const db = new Database(config.dbFile);
db.exec(`
  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY,
    media_name TEXT,
    date TEXT,
    title TEXT,
    content TEXT,
    url TEXT UNIQUE
  );
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS fingerprints (
    fingerprint TEXT PRIMARY KEY
  );
`);
const insertArticle = db.prepare(
  "INSERT OR IGNORE INTO articles (media_name, date, title, content, url) VALUES (?, ?, ?, ?, ?)"
);
const insertFingerprint = db.prepare(
  "INSERT OR IGNORE INTO fingerprints (fingerprint) VALUES (?)"
);
const isFingerprintExists = db.prepare(
  "SELECT 1 FROM fingerprints WHERE fingerprint = ?"
);

function generateFingerprint(title, content) {
  return (
    title
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .trim() +
    "-" +
    content
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .trim()
      .substring(0, 150)
  );
}

function generateMonthlyRanges(years = 2) {
  const now = moment();
  const ranges = [];
  for (let i = 0; i < years * 12; i++) {
    const end = now.clone().subtract(i, "months").endOf("month");
    const start = end.clone().startOf("month");
    ranges.push({
      startDate: start.format("MM/DD/YYYY"),
      endDate: end.format("MM/DD/YYYY"),
    });
  }
  return ranges;
}

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

function exportDbToExcel() {
  const rows = db.prepare("SELECT * FROM articles").all();
  const formatted = rows.map((row) => ({
    "News Media Name": row.media_name,
    Date: row.date,
    "Title of the News": row.title,
    "Descriptive Text": row.content,
    URL: row.url,
  }));

  const ws = XLSX.utils.json_to_sheet(formatted);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Articles");

  ws["!cols"] = [
    { wch: 25 },
    { wch: 12 },
    { wch: 60 },
    { wch: 100 },
    { wch: 50 },
  ];

  XLSX.writeFile(wb, config.outputFile);
  console.log(
    `📊 Exported ${formatted.length} articles to ${config.outputFile}`
  );
}

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

main().catch((err) => {
  console.error("❌ Fatal error:", err.message);
  db.close();
  exit(1);
});
