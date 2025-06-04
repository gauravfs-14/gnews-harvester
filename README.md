# 📰 GNews Harvester

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![Puppeteer](https://img.shields.io/badge/puppeteer-powered-blue)](https://pptr.dev/)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/gauravfs-14/gnews-harvester/graphs/commit-activity)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://makeapullrequest.com)

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

Edit the configuration in `config.js` to customize your search:

```javascript
// Configuration settings
const SEARCH_TERMS = ["climate change", "AI in education"]; // Topics to search for
const YEARS_TO_SEARCH = 2;                                  // How many years back to search
const PAGES_PER_TERM = 5;                                   // Pages per search term per date range
const OUTPUT_FILE = "news_output.xlsx";                     // Excel output filename
const DB_FILE = "news_harvester.db";                        // SQLite database filename
const DELAY_BETWEEN_REQUESTS = 2000;                        // Delay between requests (ms)
```

## Usage

Run the application with:

```bash
npm start
```

The program will:

1. Generate monthly date ranges based on the `yearsToSearch` setting
2. For each search term, iterate through all date ranges
3. Scrape Google News results page by page
4. Extract and store article data in SQLite
5. Export the collected data to an Excel file

## Output

The harvester produces two outputs:

1. **SQLite Database** (`data/news_harvester.db`): Contains all scraped articles with metadata
2. **Excel Spreadsheet** (`data/news_output.xlsx`): Formatted report with the following columns:
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

This tool is for educational and research purposes only. When scraping websites:

- Respect robots.txt files
- Implement reasonable rate limiting
- Review and comply with terms of service for target websites
- Be aware that web scraping may be subject to legal restrictions in some jurisdictions

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT). See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📋 Project Structure

```bash
gnews-harvester/
├── config.js           # Configuration settings
├── data/               # Output directory for database and Excel files
├── scripts/
│   ├── index.js        # Main application entry point
│   └── utils/          # Utility functions
│       ├── getRandomUA.js
│       ├── generateFingerprint.js 
│       ├── generateMonthlyRanges.js
│       └── setupSQLite.js
├── package.json        # Project dependencies
└── README.md           # This documentation
```

## 📬 Contact

Have questions? Reach out to the maintainer:

- GitHub: [@gauravfs-14](https://github.com/gauravfs-14)
- Twitter: [@gaurav_fs_14](https://twitter.com/gaurav_fs_14)
