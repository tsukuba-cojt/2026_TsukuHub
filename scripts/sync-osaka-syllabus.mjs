/**
 * Osaka course catalog sync from public sources (no login).
 *
 * Primary: KOAN 外部公開シラバス検索
 *   https://koan.osaka-u.ac.jp/syllabus_ex/campus/
 * Optional: CELAS 全学共通一覧 HTML / CSV / graduation-requirement seeds
 *
 * Usage:
 *   node scripts/sync-osaka-syllabus.mjs
 *   node scripts/sync-osaka-syllabus.mjs --nendo 2026
 *   node scripts/sync-osaka-syllabus.mjs --list-only
 *   node scripts/sync-osaka-syllabus.mjs --celas
 *   node scripts/sync-osaka-syllabus.mjs --csv path/to/courses.csv
 *   node scripts/sync-osaka-syllabus.mjs --seed-only
 */

import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const REQUIREMENTS_DIR = join(
  ROOT,
  "src/features/graduationCheck/osaka/data/requirements"
);

const CELAS_ORIGIN = "https://www.celas.osaka-u.ac.jp";
const CELAS_SYLLABUS_INDEX = `${CELAS_ORIGIN}/education/syllabus/`;
const KOAN_ORIGIN = "https://koan.osaka-u.ac.jp";
const KOAN_SQUARE = `${KOAN_ORIGIN}/campusweb/campussquare.do`;
const KOAN_SYLLABUS_PORTAL = "https://koan.osaka-u.ac.jp/syllabus_ex/campus/";
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

/** 学部・機構（親コードのみ。子学科の重複取得を避ける） */
const KOAN_UNDERGRAD_FACULTIES = [
  ["00", "文学部"],
  ["01", "人間科学部"],
  ["02", "法学部"],
  ["03", "経済学部"],
  ["04", "理学部"],
  ["05", "医学部（医）"],
  ["0A", "医学部（保）"],
  ["06", "歯学部"],
  ["07", "薬学部"],
  ["08", "工学部"],
  ["09", "基礎工学部"],
  ["10", "外国語学部"],
  ["13", "全学教育推進機構"],
  ["14", "マルチリンガル教育センター"],
];

const sleep = (ms) => new Promise((resolveDelay) => setTimeout(resolveDelay, ms));

const decodeHtml = (value) =>
  String(value ?? "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\u3000/g, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();

const argValue = (flag, fallback = null) => {
  const index = process.argv.indexOf(flag);
  if (index === -1) return fallback;
  return process.argv[index + 1] ?? fallback;
};

const hasFlag = (flag) => process.argv.includes(flag);

class CookieJar {
  constructor() {
    this.map = new Map();
  }

  absorb(response) {
    const raw =
      typeof response.headers.getSetCookie === "function"
        ? response.headers.getSetCookie()
        : [];
    for (const line of raw) {
      const [pair] = line.split(";");
      const eq = pair.indexOf("=");
      if (eq <= 0) continue;
      const name = pair.slice(0, eq).trim();
      const value = pair.slice(eq + 1).trim();
      if (!name) continue;
      this.map.set(name, value);
    }
  }

  header() {
    return [...this.map.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  }
}

const jar = new CookieJar();

const fetchText = async (
  url,
  { method = "GET", body = null, maxRedirects = 8, cookieJar = jar } = {}
) => {
  let currentUrl = url;
  let currentMethod = method;
  let currentBody = body;

  for (let redirect = 0; redirect <= maxRedirects; redirect += 1) {
    const headers = {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "ja,en;q=0.8",
    };
    const cookie = cookieJar.header();
    if (cookie) headers.Cookie = cookie;
    if (currentBody != null && currentMethod !== "GET") {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
    }

    const response = await fetch(currentUrl, {
      method: currentMethod,
      headers,
      body: currentMethod === "GET" ? undefined : currentBody,
      redirect: "manual",
    });
    cookieJar.absorb(response);

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) {
        throw new Error(`Redirect without Location from ${currentUrl}`);
      }
      currentUrl = new URL(location, currentUrl).toString();
      // POST redirects become GET without body (common for CampusSquare)
      if (response.status === 303 || response.status === 302 || response.status === 301) {
        currentMethod = "GET";
        currentBody = null;
      }
      continue;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch ${currentUrl}: ${response.status}`);
    }
    return response.text();
  }

  throw new Error(`Too many redirects for ${url}`);
};

const flowKey = (html) => {
  const match = html.match(/name="_flowExecutionKey"\s+value="([^"]+)"/);
  if (!match) throw new Error("KOAN flowExecutionKey が見つかりません");
  return match[1];
};

const absUrl = (href) => {
  if (!href) return null;
  if (href.startsWith("http")) return href;
  if (href.startsWith("/")) return `${CELAS_ORIGIN}${href}`;
  return `${CELAS_ORIGIN}/education/syllabus/${href}`;
};

const discoverSyllabusPages = async () => {
  const html = await fetchText(CELAS_SYLLABUS_INDEX);
  const links = new Set();
  for (const match of html.matchAll(
    /href="(\/education\/syllabus\/(?:spring-summer|autumn-winter)_[^"#?]+\/?)"/g
  )) {
    links.add(absUrl(match[1]));
  }
  return [...links].sort();
};

const semesterFromPath = (url) => {
  if (url.includes("spring-summer")) return "春～夏";
  if (url.includes("autumn-winter")) return "秋～冬";
  return "";
};

const categoryFromPath = (url) => {
  const slug = url.replace(/\/$/, "").split("/").pop() ?? "";
  return slug
    .replace(/^(spring-summer|autumn-winter)_/, "")
    .replace(/_/g, " ");
};

const parseSubjectsTables = (html, pageUrl) => {
  const semester = semesterFromPath(pageUrl);
  const categoryHint = categoryFromPath(pageUrl);
  const courses = [];

  for (const tableMatch of html.matchAll(
    /<table class="subjects">([\s\S]*?)<\/table>/gi
  )) {
    const table = tableMatch[1];
    for (const rowMatch of table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
      const row = rowMatch[1];
      if (
        /class="header"/i.test(row) ||
        /scope="col"/i.test(row) ||
        !/class="code"/i.test(row)
      ) {
        continue;
      }

      const hrefMatch = row.match(/href="([^"]+)"/i);
      const codeMatch = row.match(
        /<th class="code"[^>]*>[\s\S]*?>([\s\S]*?)<\/th>/i
      );
      if (!codeMatch) continue;

      const syllabusUrl = hrefMatch?.[1] ? decodeHtml(hrefMatch[1]) : "";
      const courseNumber = decodeHtml(codeMatch[1]);
      if (!/^\d{4,}$/.test(courseNumber)) continue;

      const period = decodeHtml(
        row.match(/<td class="period"[^>]*>([\s\S]*?)<\/td>/i)?.[1] ?? ""
      );
      const category = decodeHtml(
        row.match(/<td class="category"[^>]*>([\s\S]*?)<\/td>/i)?.[1] ?? ""
      );
      const term = decodeHtml(
        row.match(/<td class="term"[^>]*>([\s\S]*?)<\/td>/i)?.[1] ?? ""
      );
      const title = decodeHtml(
        row.match(/<td class="title"[^>]*>([\s\S]*?)<\/td>/i)?.[1] ?? ""
      );
      const instructor = decodeHtml(
        row.match(/<td class="instructor"[^>]*>([\s\S]*?)<\/td>/i)?.[1] ?? ""
      );
      const affiliation = decodeHtml(
        row.match(/<td class="affil"[^>]*>([\s\S]*?)<\/td>/i)?.[1] ?? ""
      );
      const allocation = decodeHtml(
        row.match(/<td class="alloc"[^>]*>([\s\S]*?)<\/td>/i)?.[1] ?? ""
      );

      if (!title) continue;

      courses.push({
        course_number: courseNumber,
        course_name: title,
        method: "",
        credits: "",
        target_year: "",
        semester: term || semester,
        schedule: period,
        instructor,
        overview: "",
        remarks: [category || categoryHint, affiliation, allocation]
          .filter(Boolean)
          .join(" / "),
        syllabus_url: syllabusUrl || KOAN_SYLLABUS_PORTAL,
      });
    }
  }

  return courses;
};

const fetchCelasCatalog = async () => {
  const pages = await discoverSyllabusPages();
  console.log(`Discovered ${pages.length} CELAS syllabus pages`);
  const all = [];
  for (const [index, pageUrl] of pages.entries()) {
    try {
      const html = await fetchText(pageUrl);
      const courses = parseSubjectsTables(html, pageUrl);
      console.log(
        `[${index + 1}/${pages.length}] ${pageUrl.replace(CELAS_ORIGIN, "")} → ${courses.length}`
      );
      all.push(...courses);
    } catch (error) {
      console.warn(`Skip ${pageUrl}: ${error.message}`);
    }
    await sleep(200);
  }
  return all;
};

const postKoan = async (fields) => {
  const body = new URLSearchParams(fields).toString();
  return fetchText(KOAN_SQUARE, { method: "POST", body });
};

const parseSearchRows = (html, nendo) => {
  const rows = [];
  for (const rowMatch of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const rowHtml = rowMatch[1];
    const ref = rowHtml.match(
      new RegExp(
        String.raw`referW\('${nendo}','([^']*)','([^']*)','ja_JP'\)`
      )
    );
    if (!ref) continue;
    const jShozoku = ref[1];
    const jCode = ref[2];
    const cells = [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) =>
      decodeHtml(m[1]).replace(/\n/g, " ").trim()
    );
    // typical: #, 所属, 開講区分, 学期, 曜時限, コード, 科目名, 教員, 和文ボタン...
    const department = cells[1] ?? "";
    const semester = cells[3] || cells[2] || "";
    const schedule = cells[4] ?? "";
    const listedCode = cells[5] || jCode;
    const courseName = cells[6] ?? "";
    const instructor = cells[7] ?? "";
    if (!courseName || !jCode) continue;
    rows.push({
      course_number: listedCode || jCode,
      course_name: courseName,
      method: "",
      credits: "",
      target_year: "",
      semester,
      schedule,
      instructor,
      overview: "",
      remarks: department,
      syllabus_url: `${KOAN_SQUARE}?_flowId=SYW4201600-flow&nendo=${nendo}&j_s_cd=${encodeURIComponent(jShozoku)}&j_cd=${encodeURIComponent(jCode)}&langkbn=j`,
      _jShozoku: jShozoku,
      _jCode: jCode,
      _nendo: nendo,
    });
  }
  return rows;
};

const parseDetailFields = (html) => {
  const fields = {};
  for (const match of html.matchAll(
    /<th[^>]*>([\s\S]*?)<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>/gi
  )) {
    const key = decodeHtml(match[1]).split("／")[0].trim();
    const value = decodeHtml(match[2]);
    if (!key) continue;
    fields[key] = value;
  }
  return fields;
};

const applyDetail = (course, fields) => {
  const creditsRaw = fields["単位数"] ?? "";
  const creditsMatch = creditsRaw.match(/(\d+(?:\.\d+)?)/);
  const yearRaw = fields["年次"] ?? "";
  const overview =
    fields["授業の目的と概要"] ||
    fields["授業の目的"] ||
    fields["概要"] ||
    "";
  const method = fields["授業形態"] ?? course.method ?? "";
  const numbering = fields["ナンバリング"] ?? "";
  const required = fields["必修･選択"] || fields["必修・選択"] || "";
  const language = fields["開講言語"] ?? "";
  const remarks = [
    course.remarks,
    numbering ? `ナンバリング:${numbering}` : "",
    required ? `必修選択:${required}` : "",
    language ? `言語:${language}` : "",
  ]
    .filter(Boolean)
    .join(" / ");

  return {
    ...course,
    course_name:
      fields["開講科目名"] ||
      fields["開講科目名(英)"] ||
      course.course_name,
    credits: creditsMatch ? String(Number(creditsMatch[1])) : course.credits,
    target_year: yearRaw.replace(/\s+/g, "") || course.target_year,
    semester: fields["開講区分(開講学期)"] || course.semester,
    schedule: fields["曜日・時間"] || course.schedule,
    instructor: fields["担当教員"] || course.instructor,
    method,
    overview: overview || course.overview || course.course_name,
    remarks,
  };
};

const fetchKoanDetail = async (course, { retries = 3 } = {}) => {
  let lastError = null;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const localJar = new CookieJar();
    try {
      const boot = await fetchText(
        `${KOAN_SQUARE}?_flowId=SYW4201600-flow&locale=ja_JP`,
        { cookieJar: localJar }
      );
      if (boot.includes("認証エラー")) {
        throw new Error("detail auth error on boot");
      }
      const key = flowKey(boot);
      const url =
        `${KOAN_SQUARE}?_eventId=eventSyReferInfoWindow` +
        `&_flowExecutionKey=${encodeURIComponent(key)}` +
        `&nendo=${encodeURIComponent(course._nendo)}` +
        `&jikanwariShozokucd=${encodeURIComponent(course._jShozoku)}` +
        `&jikanwaricd=${encodeURIComponent(course._jCode)}` +
        `&locale=ja_JP`;
      const html = await fetchText(url, { cookieJar: localJar });
      if (html.includes("認証エラー") || !html.includes("単位数")) {
        throw new Error("detail page missing syllabus fields");
      }
      return applyDetail(course, parseDetailFields(html));
    } catch (error) {
      lastError = error;
      await sleep(200 * attempt);
    }
  }
  throw lastError ?? new Error("detail failed");
};

const mapPool = async (items, concurrency, worker) => {
  const results = new Array(items.length);
  let next = 0;
  const runners = Array.from({ length: Math.max(1, concurrency) }, async () => {
    while (true) {
      const index = next;
      next += 1;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
};

const fetchKoanCatalog = async ({
  nendo,
  listOnly = false,
  detailConcurrency = 4,
  faculties = KOAN_UNDERGRAD_FACULTIES,
}) => {
  console.log(`KOAN public syllabus: nendo=${nendo}`);
  jar.map.clear();
  let html = await fetchText(
    `${KOAN_SQUARE}?_flowId=SYW4201600-flow&locale=ja_JP`
  );
  if (html.includes("認証エラー")) {
    // 公開入口経由でセッションを張り直す
    jar.map.clear();
    await fetchText(KOAN_SYLLABUS_PORTAL);
    html = await fetchText(
      `${KOAN_SQUARE}?_flowId=SYW4201600-flow&locale=ja_JP`
    );
  }
  if (html.includes("認証エラー")) {
    throw new Error("KOAN 公開シラバスにアクセスできません（認証エラー）");
  }
  let key = flowKey(html);

  html = await postKoan({
    s_no: "0",
    _flowExecutionKey: key,
    _eventId: "nendoShozokuSettingByMulti",
    categoryFlg: "1",
    _gymnasticsFlg: "1",
    nendo: String(nendo),
    kaikokbncd: "",
    yobi: "",
    jigen: "",
    nenji: "",
    bunyacd: "",
    kaikoKamokunm: "",
    kyokannm: "",
    kyokankn: "",
    freeword: "",
    freewordCondition: "0",
  });
  key = flowKey(html);

  const listed = [];
  for (const [code, label] of faculties) {
    html = await postKoan({
      s_no: "0",
      _flowExecutionKey: key,
      _eventId: "search",
      categoryFlg: "1",
      _gymnasticsFlg: "1",
      nendo: String(nendo),
      jShozokuCodeMajor: code,
      kaikokbncd: "",
      yobi: "",
      jigen: "",
      nenji: "",
      bunyacd: "",
      kaikoKamokunm: "",
      kyokannm: "",
      kyokankn: "",
      freeword: "",
      freewordCondition: "0",
    });
    key = flowKey(html);

    const facultyRows = [];
    let page = 1;
    while (true) {
      if (page > 1) {
        const pageUrl =
          `${KOAN_SQUARE}?_flowExecutionKey=${encodeURIComponent(key)}` +
          `&_eventId_paging=_eventId_paging&_displayCount=100&_pageCount=${page}`;
        html = await fetchText(pageUrl);
        key = flowKey(html);
      }
      const rows = parseSearchRows(html, String(nendo));
      facultyRows.push(...rows);
      const pageNums = [
        ...html.matchAll(/_pageCount=(\d+)/g),
      ].map((match) => Number(match[1]));
      const maxPage = pageNums.length ? Math.max(...pageNums) : page;
      const hasNext = page < maxPage || html.includes("次へ");
      console.log(
        `  [${code} ${label}] page ${page}: +${rows.length} (total ${facultyRows.length}) maxPage=${maxPage}`
      );
      if (!rows.length || !hasNext) break;
      page += 1;
      if (page > 200) break;
      await sleep(120);
    }
    listed.push(...facultyRows);
    await sleep(150);
  }

  console.log(`KOAN list rows: ${listed.length}`);
  if (listOnly) {
    return listed.map(({ _jShozoku, _jCode, _nendo, ...rest }) => rest);
  }

  console.log(`Fetching syllabus details (concurrency=${detailConcurrency})...`);
  let done = 0;
  let ok = 0;
  const detailed = await mapPool(listed, detailConcurrency, async (course) => {
    try {
      const enriched = await fetchKoanDetail(course);
      done += 1;
      ok += 1;
      if (done % 50 === 0 || done === listed.length) {
        console.log(`  details ${done}/${listed.length} ok=${ok}`);
      }
      await sleep(20);
      const { _jShozoku, _jCode, _nendo, ...rest } = enriched;
      return rest;
    } catch (error) {
      done += 1;
      console.warn(
        `  detail fail ${course.course_number}: ${error.message}`
      );
      const { _jShozoku, _jCode, _nendo, ...rest } = course;
      return rest;
    }
  });

  return detailed;
};

const stableCourseNumber = (name) => {
  const hash = createHash("sha256").update(name).digest("hex").slice(0, 8);
  return `OU-${hash.toUpperCase()}`;
};

const isCourseNameCandidate = (value) => {
  if (!value || value.length < 2 || value.length > 40) return false;
  if (value.includes("http") || value.includes("::")) return false;
  if (/^osaka-/.test(value)) return false;
  if (/^20\d{2}/.test(value)) return false;
  if (/^[a-z-]+$/.test(value) && !value.includes("科目")) return false;
  return true;
};

const collectRequirementCourseNames = async () => {
  const names = new Set();
  const walk = async (dir) => {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }
      if (!entry.name.endsWith(".ts")) continue;
      const source = await readFile(fullPath, "utf8");
      for (const match of source.matchAll(
        /const\s+\w+\s*=\s*\[([\s\S]*?)\];/g
      )) {
        for (const item of match[1].matchAll(/"([^"\\]+)"/g)) {
          const name = item[1].trim();
          if (isCourseNameCandidate(name)) names.add(name);
        }
      }
    }
  };
  await walk(REQUIREMENTS_DIR);
  return names;
};

const toCatalogCourse = (entry) => ({
  course_number: entry.course_number ?? "",
  course_name: entry.course_name ?? "",
  method: entry.method ?? "",
  credits: entry.credits ?? "",
  target_year: entry.target_year ?? "",
  semester: entry.semester ?? "",
  schedule: entry.schedule ?? "",
  instructor: entry.instructor ?? "",
  overview: entry.overview ?? "",
  remarks: entry.remarks ?? "",
  syllabus_url: entry.syllabus_url ?? KOAN_SYLLABUS_PORTAL,
});

const parseCsvCourses = (text) => {
  const lines = text.trim().split(/\r?\n/).slice(1);
  return lines
    .map((line) => {
      const cols = line.split(",").map((cell) => cell.trim());
      if (cols.length < 2 || !cols[0] || !cols[1]) return null;
      return toCatalogCourse({
        course_number: cols[0],
        course_name: cols[1],
        method: cols[2] ?? "",
        credits: cols[3] ?? "",
        target_year: cols[4] ?? "",
        semester: cols[5] ?? "",
        schedule: cols[6] ?? "",
        instructor: cols[7] ?? "",
        overview: cols[8] ?? "",
        remarks: cols[9] ?? "",
        syllabus_url: cols[10] ?? KOAN_SYLLABUS_PORTAL,
      });
    })
    .filter(Boolean);
};

const mergeCourses = (entries) => {
  const byNumber = new Map();
  for (const course of entries) {
    const number = String(course.course_number ?? "").trim();
    const name = course.course_name.normalize("NFKC").trim();
    if (!number || !name) continue;
    const next = { ...course, course_name: name, course_number: number };
    const existing = byNumber.get(number);
    if (!existing) {
      byNumber.set(number, next);
      continue;
    }
    const score = (c) =>
      (c.overview && c.overview !== c.course_name ? 4 : 0) +
      (c.credits ? 3 : 0) +
      (c.target_year ? 2 : 0) +
      (c.schedule ? 2 : 0) +
      (c.instructor ? 2 : 0) +
      (c.method ? 1 : 0) +
      (c.syllabus_url?.includes("j_cd=") ? 2 : 0) +
      (c.remarks ? 1 : 0);
    if (score(next) >= score(existing)) byNumber.set(number, next);
  }
  return [...byNumber.values()].sort((a, b) =>
    a.course_name.localeCompare(b.course_name, "ja")
  );
};

const buildSeedExtras = async (knownNames) => {
  const requirementNames = await collectRequirementCourseNames();
  let extraNames = [];
  try {
    extraNames = JSON.parse(
      await readFile(join(__dirname, "osaka/course-seed.json"), "utf8")
    );
  } catch {
    // optional
  }
  return [...requirementNames, ...extraNames]
    .filter((name) => !knownNames.has(name.normalize("NFKC").trim()))
    .map((course_name) =>
      toCatalogCourse({
        course_number: stableCourseNumber(course_name),
        course_name,
        remarks: "seed (not found in KOAN/CELAS)",
      })
    );
};

const main = async () => {
  const outputPath = resolve(ROOT, "public/data/courses/osaka.json");
  const csvPath = argValue("--csv");
  const seedOnly = hasFlag("--seed-only");
  const listOnly = hasFlag("--list-only");
  const includeCelas = hasFlag("--celas");
  const nendo = Number(argValue("--nendo", "2026"));
  const detailConcurrency = Number(argValue("--concurrency", "4"));

  let courses = [];
  let source = "koan-public-syllabus";

  if (csvPath) {
    courses = parseCsvCourses(await readFile(csvPath, "utf8"));
    source = "csv-import";
  } else if (seedOnly) {
    const requirementNames = await collectRequirementCourseNames();
    let extraNames = [];
    try {
      extraNames = JSON.parse(
        await readFile(join(__dirname, "osaka/course-seed.json"), "utf8")
      );
    } catch {
      // optional
    }
    courses = [...requirementNames, ...extraNames].map((course_name) =>
      toCatalogCourse({
        course_number: stableCourseNumber(course_name),
        course_name,
      })
    );
    source = "seed+graduation-requirements";
  } else {
    const koanCourses = await fetchKoanCatalog({
      nendo,
      listOnly,
      detailConcurrency,
    });
    courses = [...koanCourses];
    source = listOnly
      ? "koan-public-syllabus-list"
      : "koan-public-syllabus+details";

    if (includeCelas) {
      const celasCourses = await fetchCelasCatalog();
      courses = [...courses, ...celasCourses];
      source += "+celas";
    }

    const knownNames = new Set(
      courses.map((c) => c.course_name.normalize("NFKC").trim())
    );
    const seedExtras = await buildSeedExtras(knownNames);
    courses = [...courses, ...seedExtras];
    if (seedExtras.length) source += "+seed";
  }

  courses = mergeCourses(courses.map(toCatalogCourse));

  const output = {
    university: "osaka",
    updated: new Date().toISOString().slice(0, 10),
    source,
    courses,
  };

  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Wrote ${courses.length} courses to ${outputPath}`);
  console.log(`Source: ${source}`);

  const withCredits = courses.filter((c) => c.credits).length;
  const withOverview = courses.filter(
    (c) => c.overview && c.overview !== c.course_name
  ).length;
  console.log(
    `Stats: credits=${withCredits}, richOverview=${withOverview}, instructors=${courses.filter((c) => c.instructor).length}`
  );
};

void main();
