// seed rosters table
// call example: npx tsx lib/db/seedRoster.ts ./lib/db/roster.csv

import { readFile } from "node:fs/promises"
import { rosters } from "./schema";
import { db } from "./drizzle";

const csvFilePath = process.argv[2];

if (!csvFilePath) {
  console.error('Please provide the CSV file path as an argument');
  console.error('Usage: npx tsx lib/db/seedRoster.ts <path-to-csv>');
  process.exit(1);
}

readFile(csvFilePath, 'utf-8').then(async file => {
  console.log(file);
    const rows = file.split("\n");
    for await (const row of rows) {
      if (!row.trim()) continue; // Skip empty rows
      
      const [dateStr, service, name] = row.split(",");
      
      await db.insert(rosters).values({
        date: dateStr.trim(),
        name: name.trim(),
        service: service.trim(),
      });
    }
    console.log("Insertions completed")
    process.exit(0)
}).catch(err => {
  console.error('Error reading file:', err);
});
