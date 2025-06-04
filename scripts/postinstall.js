const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "..", "config.js");
const templatePath = path.join(__dirname, "config.template.js");

if (!fs.existsSync(configPath)) {
  fs.copyFileSync(templatePath, configPath);
  console.log("\x1b[32m✔️  Created config.js from template.\x1b[0m");
  console.log(
    "\x1b[33m🛠️  Please edit config.js to set your preferences.\x1b[0m\n"
  );
} else {
  console.log(
    "\x1b[90m⚙️  config.js already exists. Skipping overwrite.\x1b[0m"
  );
}
