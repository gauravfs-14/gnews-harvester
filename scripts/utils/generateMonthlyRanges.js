const moment = require("moment");

/**
 * Generates an array of monthly date ranges going back a specified number of years
 * These ranges are used to segment Google News searches by time period
 *
 * @param {number} years - Number of years to look back
 * @returns {Array<Object>} Array of objects with startDate and endDate properties
 */
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

module.exports = generateMonthlyRanges;
