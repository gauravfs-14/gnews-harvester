const Database = require("better-sqlite3");
const fs = require("fs");

const config = require("../../config.js");

// === SQLite DB Setup ===
if (!fs.existsSync("data")) {
  fs.mkdirSync("data");
}
const db = new Database("data/" + config.dbFile);
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

/**
 * Prepared statement for inserting a new fingerprint into the database
 * Used as part of the article deduplication process
 * @type {Object}
 */
const insertFingerprint = db.prepare(
  "INSERT OR IGNORE INTO fingerprints (fingerprint) VALUES (?)"
);

/**
 * Prepared statement to check if a fingerprint already exists in the database
 * Returns a result if the fingerprint exists, undefined otherwise
 * @type {Object}
 */
const isFingerprintExists = db.prepare(
  "SELECT 1 FROM fingerprints WHERE fingerprint = ?"
);

module.exports = {
  db,
  insertArticle,
  insertFingerprint,
  isFingerprintExists,
};
