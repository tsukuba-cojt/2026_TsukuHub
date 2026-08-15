import { writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Papa from "papaparse";

const CSV_DIR =
  "https://raw.githubusercontent.com/Make-IT-TSUKUBA/alternative-tsukuba-kdb/main/csv";

const toDateStamp = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

const fetchLatestCsv = async () => {
  const cursor = new Date();
  for (let offset = 0; offset < 14; offset += 1) {
    const stamp = toDateStamp(cursor);
    const url = `${CSV_DIR}/kdb-${stamp}.csv`;
    const response = await fetch(url);
    if (response.ok) {
      return { stamp, text: await response.text() };
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  throw new Error("KdB CSV を取得できませんでした。");
};

const mapRow = (row: string[]) => ({
  course_number: row[0] ?? "",
  course_name: row[1] ?? "",
  method: row[2] ?? "",
  credits: row[3] ?? "",
  target_year: row[4] ?? "",
  semester: row[5] ?? "",
  schedule: row[6] ?? "",
  instructor: row[7] ?? "",
  overview: row[8] ?? "",
  remarks: row[9] ?? "",
});

const main = async () => {
  const { stamp, text } = await fetchLatestCsv();
  const parsed = Papa.parse<string[]>(text, { skipEmptyLines: true });
  const seen = new Set<string>();
  const courses = [];

  for (const row of parsed.data) {
    const code = row[0]?.trim();
    if (!code || code === "科目番号" || seen.has(code)) continue;
    seen.add(code);
    courses.push(mapRow(row));
  }

  const outputPath = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "../../public/data/courses/tsukuba.json",
  );
  const updated = `${stamp.slice(0, 4)}-${stamp.slice(4, 6)}-${stamp.slice(6, 8)}`;
  await writeFile(
    outputPath,
    JSON.stringify({
      university: "tsukuba",
      updated,
      source: "https://github.com/Make-IT-TSUKUBA/alternative-tsukuba-kdb",
      courses,
    }),
  );
  console.log(`Wrote ${courses.length} courses to ${outputPath} (${updated})`);
};

void main();
