# 📰 GNews Harvester

A powerful web scraping tool for collecting news articles from Google News about specific topics over a defined time period.

> This project is designed to help researchers, journalists, and developers gather news data efficiently while respecting web scraping best practices. For educational purposes only.

## Features

- Scrape Google News search results for specified search terms
- Search across multiple date ranges automatically
- Stealth browser automation to avoid detection
- Extract article content, titles, dates, and sources
- Deduplication using content fingerprinting
- Store results in SQLite database
- Export data to Excel spreadsheet
- User agent rotation to reduce blocking

## Installation

1. Clone the repository

```bash
git clone https://github.com/gauravfs-14/gnews-harvester.git
cd gnews-harvester
```

2. Install dependencies

```bash
npm install
```

## Requirements

- Node.js (v14 or higher recommended) |
    Install Node.js from [nodejs.org](https://nodejs.org/)
- NPM package manager

## Configuration

Edit the configuration object in `index.js` to customize your search:

```javascript
const config = {
  searchTerms: ["climate change", "AI in education"],  // Topics to search for
  yearsToSearch: 2,                                    // How many years back to search
  pagesPerTerm: 5,                                     // Pages to scrape per search term per date range
  outputFile: "news_output.xlsx",                      // Excel output filename
  dbFile: "news_harvester.db",                         // SQLite database filename
  delayBetweenRequests: 2000,                          // Delay between requests in milliseconds
};
```

## Usage

Run the application with:

```bash
node index.js
```

The program will:

1. Generate monthly date ranges based on the `yearsToSearch` setting
2. For each search term, iterate through all date ranges
3. Scrape Google News results page by page
4. Extract and store article data in SQLite
5. Export the collected data to an Excel file

## Output

The harvester produces two outputs:

1. **SQLite Database** (`news_harvester.db`): Contains all scraped articles with metadata
2. **Excel Spreadsheet** (`news_output.xlsx`): Formatted report with the following columns:
   - News Media Name
   - Date
   - Title of the News
   - Descriptive Text
   - URL

## How It Works

1. The tool uses Puppeteer with a stealth plugin to navigate Google News
2. It searches for each term within specific monthly date ranges
3. For each search result, it extracts the article URL
4. It then visits each URL and extracts content using Cheerio
5. Articles are deduplicated using content fingerprinting
6. Results are stored in SQLite and exported to Excel

## Troubleshooting

- **CAPTCHA Issues**: If you see CAPTCHA warnings in the console, the script will pause briefly. You may need to reduce the scraping frequency or use proxies.
- **No Links Found**: This may indicate that Google has changed its DOM structure. Check for updates.
- **Scraping Errors**: Individual article scraping errors are logged but won't stop the overall process.

## Legal Considerations

This tool is for educational purposes only. When scraping websites:

- Respect robots.txt files
- Implement reasonable rate limiting
- Review and comply with terms of service for target websites
- Be aware that web scraping may be subject to legal restrictions in some jurisdictions

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
