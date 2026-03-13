// seed bibleDaily table

import { readFile } from "node:fs/promises"
import { bibleDaily } from "./schema";
import { db } from "./drizzle";

readFile('./lib/db/bibleDaily.csv', 'utf-8').then(async file => {
  console.log(file);
    const rows = file.split("\n");
    for await (const row of rows) {
      const [date, contents] = row.split(",");
      await db.insert(bibleDaily).values({
        date: date,
        contents: contents,
      });
    }
    console.log("Insertions completed")
    process.exit(0)
}).catch(err => {
  console.error('Error reading file:', err);
});
