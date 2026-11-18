import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ACADEMIC_YEARS = [2023, 2024, 2025, 2026];
const UNIVERSITY = "tsukuba";
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const courseDirectory = resolve(scriptDirectory, "../../public/data/courses");
const outputDirectory = resolve(scriptDirectory, "../../public/data/graduation");
const courseCodePattern = /(?<![0-9A-Z])[0-9A-Z]{7}(?![0-9A-Z])/g;
const sameCoursePhrasePattern = /([^。\n]{0,160})と同一/g;

const extractSameCourseCodes = (courseCode, remarks) => {
  const matches = new Set();
  for (const phrase of remarks.matchAll(sameCoursePhrasePattern)) {
    for (const rawCode of phrase[1].match(courseCodePattern) ?? []) {
      const code = rawCode.trim().toUpperCase();
      if (code !== courseCode) matches.add(code);
    }
  }
  return matches;
};

const buildGroups = (courses) => {
  const parent = new Map();
  const find = (code) => {
    const current = parent.get(code);
    if (current === undefined) {
      parent.set(code, code);
      return code;
    }
    if (current === code) return code;
    const root = find(current);
    parent.set(code, root);
    return root;
  };
  const union = (left, right) => {
    const leftRoot = find(left);
    const rightRoot = find(right);
    if (leftRoot !== rightRoot) parent.set(rightRoot, leftRoot);
  };

  for (const course of courses) {
    const courseCode = course.course_number.trim().toUpperCase();
    for (const sameCourseCode of extractSameCourseCodes(
      courseCode,
      course.remarks ?? "",
    )) {
      union(courseCode, sameCourseCode);
    }
  }

  const grouped = new Map();
  for (const code of parent.keys()) {
    const root = find(code);
    const group = grouped.get(root) ?? [];
    group.push(code);
    grouped.set(root, group);
  }
  return [...grouped.values()]
    .map((group) => group.sort())
    .filter((group) => group.length > 1)
    .sort((left, right) => left[0].localeCompare(right[0]));
};

await mkdir(outputDirectory, { recursive: true });
for (const academicYear of ACADEMIC_YEARS) {
  const inputPath = resolve(
    courseDirectory,
    `${UNIVERSITY}-${academicYear}.json`,
  );
  const catalog = JSON.parse(await readFile(inputPath, "utf8"));
  if (
    catalog.academic_year !== academicYear ||
    !catalog.source_sha256 ||
    !catalog.source_url ||
    !catalog.repository_commit
  ) {
    throw new Error(`${inputPath}の年度・出典情報が一致しません。`);
  }
  const groups = buildGroups(catalog.courses ?? []);
  const bioresourcesNames = JSON.parse(await readFile(resolve(scriptDirectory,
    "../features/graduationCheck/data/bioresourcesFoundationCourses.json"), "utf8"));
  const foundationNameSet = new Set([...bioresourcesNames.introductions, ...bioresourcesNames.foundation]);
  // EB15〜EB99のみ。授業方法3/6だけでは実験・実習を区別できないため、
  // 固定カタログの科目名も併用する。不整合・名称だけでは特定できない科目はnull。
  const instructionMethods = Object.fromEntries((catalog.courses ?? [])
    .filter((course) => /^EB(?:1[5-9]|[2-9])/.test(course.course_number) || /^EC[23]/.test(course.course_number) || foundationNameSet.has(course.course_name))
    .map((course) => {
      const method = String(course.method ?? "").trim();
      const name = course.course_name.normalize("NFKC");
      let classification = null;
      if (["3", "6"].includes(method)) {
        if (name.includes("実習")) classification = "practicum";
        else if (name.includes("実験")) classification = "experiment";
      } else if (["1", "2", "4"].includes(method) && !/実験|実習/.test(name)) {
        classification = /^EB(?:1[5-9]|[2-9])/.test(course.course_number)
          ? "other" : method === "1" ? "lecture" : method === "2" ? "seminar" : null;
      }
      return [course.course_number, classification];
    }));
  const payload = {
    schema_version: "graduation-cross-listings-1.0.0",
    university: UNIVERSITY,
    academic_year: academicYear,
    source_updated: catalog.updated,
    source_sha256: catalog.source_sha256,
    source_url: catalog.source_url,
    repository_commit: catalog.repository_commit,
    instruction_method_policy: "biology-name-and-method-v1",
    instruction_methods: instructionMethods,
    bioresources_method_policy: "bioresources-name-and-method-v1",
    bioresources_core_courses: (catalog.courses ?? []).filter((course) =>
      /^EC2/.test(course.course_number) && /基幹科目/.test(course.remarks ?? "")).map((course) => course.course_number).sort(),
    groups,
  };
  const outputPath = resolve(
    outputDirectory,
    `${UNIVERSITY}-${academicYear}-cross-listings.json`,
  );
  await writeFile(outputPath, JSON.stringify(payload), "utf8");
  console.log(`Wrote ${groups.length} cross-listing groups to ${outputPath}`);
}
