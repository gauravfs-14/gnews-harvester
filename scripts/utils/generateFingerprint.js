/**
 * Generates a unique fingerprint for an article based on title and content
 * The fingerprint is used to identify and filter duplicate articles
 *
 * @param {string} title - The article title
 * @param {string} content - The article content
 * @returns {string} A fingerprint string that represents the article
 */
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

module.exports = generateFingerprint;
