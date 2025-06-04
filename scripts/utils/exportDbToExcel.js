/**
 * Exports all articles from SQLite database to an Excel spreadsheet
 * Formats column widths and names for better readability
 *
 * @returns {void}
 */
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

  XLSX.writeFile(wb, "data/" + config.outputFile);
  console.log(
    `📊 Exported ${formatted.length} articles to ${"data/" + config.outputFile}`
  );
}

module.exports = exportDbToExcel;
