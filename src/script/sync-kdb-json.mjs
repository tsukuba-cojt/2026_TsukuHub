import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Papa from "papaparse";

const CSV_DIR =
  "https://raw.githubusercontent.com/Make-IT-TSUKUBA/alternative-tsukuba-kdb/main/csv";
const PINNED_COMMIT = "b3d77356c21bad19dd3578f316b9fcec7f7f47a7";
const UNIVERSITY = "tsukuba";
const CURRENT_ACADEMIC_YEAR = 2026;
const historicalCatalogs = new Map([
  [
    2023,
    {
      fileName: "kdb-20240331.csv",
      sha256:
        "8aca44f7c164d35bbb4449a5198610260c96713a759de0d1f295d36127cbbeff",
    },
  ],
  [
    2024,
    {
      fileName: "kdb-20250331.csv",
      sha256:
        "3a74de3ea118a85c420cf67728a42f7155c834f6afff8682b8d15142139fbe15",
    },
  ],
  [
    2025,
    {
      fileName: "kdb-20251031.csv",
      sha256:
        "ed59d7f92b9faf6e60d9adbb7d50747027e4cdc9469b3a3e6154254205fdf13b",
    },
  ],
  [
    2026,
    {
      fileName: "kdb-20261016.csv",
      sha256:
        "b46050ba62c0ffa989402ef688321144118ea461262a68534b529f8c04988ca5",
    },
  ],
]);
const supportedAcademicYears = [2023, 2024, 2025, 2026];
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const outputDirectory = resolve(scriptDirectory, "../../public/data/courses");

const toDateStamp = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

const pinnedUrl = (fileName) =>
  `https://raw.githubusercontent.com/Make-IT-TSUKUBA/alternative-tsukuba-kdb/${PINNED_COMMIT}/csv/${fileName}`;

const fetchLatestCsv = async () => {
  const cursor = new Date();
  for (let offset = 0; offset < 14; offset += 1) {
    const stamp = toDateStamp(cursor);
    const url = `${CSV_DIR}/kdb-${stamp}.csv`;
    const response = await fetch(url);
    if (response.ok) {
      return { stamp, source: Buffer.from(await response.arrayBuffer()), url };
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  throw new Error("KdB CSV を取得できませんでした。");
};

const parseArguments = () => {
  const args = process.argv.slice(2);
  const localInputs = new Map();
  const requestedYears = new Set();
  let syncAll = false;
  for (const argument of args) {
    if (argument === "--all") {
      syncAll = true;
      continue;
    }
    const separator = argument.indexOf("=");
    if (separator > 0) {
      const year = Number(argument.slice(0, separator));
      if (!supportedAcademicYears.includes(year)) {
        throw new Error(`未対応の年度です: ${argument.slice(0, separator)}`);
      }
      localInputs.set(year, argument.slice(separator + 1));
      requestedYears.add(year);
      continue;
    }
    const year = Number(argument);
    if (!supportedAcademicYears.includes(year)) {
      throw new Error(`引数は --all、YEAR、YEAR=PATH のいずれかです: ${argument}`);
    }
    requestedYears.add(year);
  }
  const years = syncAll
    ? supportedAcademicYears
    : requestedYears.size > 0
      ? [...requestedYears].sort()
      : [CURRENT_ACADEMIC_YEAR];
  return { localInputs, years };
};

const readCatalogSource = async (academicYear, localInputs) => {
  const localPath = localInputs.get(academicYear);
  const historical = historicalCatalogs.get(academicYear);
  if (localPath) {
    const source = await readFile(resolve(localPath));
    const fileName = historical?.fileName ?? `kdb-${toDateStamp(new Date())}.csv`;
    return {
      source,
      fileName,
      url: historical ? pinnedUrl(fileName) : `${CSV_DIR}/${fileName}`,
    };
  }
  if (historical) {
    const url = pinnedUrl(historical.fileName);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`${academicYear}年度KdB CSVの取得に失敗しました: ${response.status}`);
    }
    return {
      source: Buffer.from(await response.arrayBuffer()),
      fileName: historical.fileName,
      url,
    };
  }
  const latest = await fetchLatestCsv();
  return {
    source: latest.source,
    fileName: `kdb-${latest.stamp}.csv`,
    url: latest.url,
  };
};

const normalizeHeader = (value) => value?.trim() ?? "";

const parseCatalog = (source, academicYear) => {
  const parsed = Papa.parse(source.toString("utf8"), { skipEmptyLines: true });
  const firstRow = parsed.data[0] ?? [];
  const hasHeader = normalizeHeader(firstRow[0]) === "科目番号";
  const header = hasHeader ? firstRow.map(normalizeHeader) : null;
  const rows = hasHeader ? parsed.data.slice(1) : parsed.data;
  const indexOf = (name, fallback) => {
    if (!header) return fallback;
    const index = header.indexOf(name);
    if (index < 0) throw new Error(`${academicYear}年度CSVに「${name}」列がありません。`);
    return index;
  };
  const indexes = {
    courseNumber: indexOf("科目番号", 0),
    courseName: indexOf("科目名", 1),
    method: indexOf("授業方法", 2),
    credits: indexOf("単位数", 3),
    targetYear: indexOf("標準履修年次", 4),
    semester: indexOf("実施学期", 5),
    schedule: indexOf("曜時限", 6),
    classroom: header ? header.indexOf("教室") : -1,
    instructor: indexOf("担当教員", 7),
    overview: indexOf("授業概要", 8),
    remarks: indexOf("備考", 9),
  };
  const seen = new Set();
  const courses = [];
  let skippedRowCount = 0;
  let duplicateCourseCodeCount = 0;
  for (const row of rows) {
    const courseNumber = row[indexes.courseNumber]?.trim().toUpperCase();
    if (!courseNumber) {
      skippedRowCount += 1;
      continue;
    }
    if (seen.has(courseNumber)) {
      duplicateCourseCodeCount += 1;
      continue;
    }
    seen.add(courseNumber);
    courses.push({
      academic_year: academicYear,
      course_number: courseNumber,
      course_name: row[indexes.courseName]?.trim() ?? "",
      method: row[indexes.method]?.trim() ?? "",
      credits: row[indexes.credits]?.trim() ?? "",
      target_year: row[indexes.targetYear]?.trim() ?? "",
      semester: row[indexes.semester]?.trim() ?? "",
      schedule: row[indexes.schedule]?.trim() ?? "",
      classroom:
        indexes.classroom >= 0 ? (row[indexes.classroom]?.trim() ?? "") : "",
      instructor: row[indexes.instructor]?.trim() ?? "",
      overview: row[indexes.overview]?.trim() ?? "",
      remarks: row[indexes.remarks]?.trim() ?? "",
    });
  }
  return {
    courses,
    sourceRowCount: rows.length,
    skippedRowCount,
    duplicateCourseCodeCount,
    parseWarningCount: new Set(
      parsed.errors.map(
        (error) => `${error.code}\0${error.row ?? ""}\0${error.message}`,
      ),
    ).size,
  };
};

const verifyHistoricalHash = (academicYear, source) => {
  const expected = historicalCatalogs.get(academicYear)?.sha256;
  const actual = createHash("sha256").update(source).digest("hex");
  if (expected && actual !== expected) {
    throw new Error(
      `${academicYear}年度CSVのSHA-256が一致しません: expected=${expected}, actual=${actual}`,
    );
  }
  return actual;
};

const writeCatalog = async (academicYear, localInputs) => {
  const { source, fileName, url } = await readCatalogSource(
    academicYear,
    localInputs,
  );
  const sha256 = verifyHistoricalHash(academicYear, source);
  const parsed = parseCatalog(source, academicYear);
  const stamp = fileName.match(/\d{8}/)?.[0];
  if (!stamp) throw new Error(`スナップショット日を取得できません: ${fileName}`);
  const snapshotDate = `${stamp.slice(0, 4)}-${stamp.slice(4, 6)}-${stamp.slice(6, 8)}`;
  const payload = {
    schema_version: "course-catalog-file-2.0.0",
    university: UNIVERSITY,
    academic_year: academicYear,
    updated: snapshotDate,
    source: "https://github.com/Make-IT-TSUKUBA/alternative-tsukuba-kdb",
    source_url: url,
    source_sha256: sha256,
    ...(historicalCatalogs.has(academicYear)
      ? { repository_commit: PINNED_COMMIT }
      : {}),
    source_row_count: parsed.sourceRowCount,
    skipped_row_count: parsed.skippedRowCount,
    duplicate_course_code_count: parsed.duplicateCourseCodeCount,
    parse_warning_count: parsed.parseWarningCount,
    courses: parsed.courses,
  };
  const serialized = JSON.stringify(payload);
  const annualPath = resolve(outputDirectory, `${UNIVERSITY}-${academicYear}.json`);
  await writeFile(annualPath, serialized);
  console.log(
    `Wrote ${parsed.courses.length} courses to ${annualPath} (${snapshotDate}; skipped=${parsed.skippedRowCount}; duplicates=${parsed.duplicateCourseCodeCount}; warnings=${parsed.parseWarningCount})`,
  );
};

const { localInputs, years } = parseArguments();
for (const academicYear of years) {
  await writeCatalog(academicYear, localInputs);
}
