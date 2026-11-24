/** Pythonテストから呼び出す、本番のCSV解析・卒業要件判定への接続処理。 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { checkGraduationWithCatalog } from "../../checkGraduation";
import { resolveRequirementId } from "../../data/supportedDepartments";
import { parseGradesCsv } from "../../parseCsv";

type Input = {
  csvText: string;
  selection: {
    departmentKey: string;
    majorKey: string;
    admissionYear: number;
  };
  publicRoot: string;
};

async function main() {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
  const input = JSON.parse(Buffer.concat(chunks).toString("utf8")) as Input;
  const { departmentKey, majorKey, admissionYear } = input.selection;
  const requirementId = resolveRequirementId(departmentKey, majorKey, admissionYear);
  if (!requirementId) throw new Error("学類・主専攻・入学年度に対応する卒業要件がありません。");

  // ブラウザの静的JSON取得をローカルファイル読み込みに置換する。
  // カタログ内容・CSV解析・照合・集計には本番実装と実データを使う。
  globalThis.fetch = async (resource) => {
    const route = String(resource);
    if (!/^\/data\/graduation\/tsukuba-\d{4}-cross-listings\.json$/.test(route)) {
      throw new Error(`想定外のカタログURL: ${route}`);
    }
    const json = await readFile(resolve(input.publicRoot, route.slice(1)), "utf8");
    return new Response(json, { headers: { "Content-Type": "application/json" } });
  };

  const parsed = parseGradesCsv(input.csvText);
  const report = await checkGraduationWithCatalog(parsed.courses, requirementId, "tsukuba");
  process.stdout.write(JSON.stringify({
    courseCount: parsed.courses.length,
    csvErrors: parsed.errors,
    requirement: report.requirement,
    catalogVerification: report.catalogVerification,
    summary: report.summary,
    categories: Object.fromEntries(report.categories.map((category) => [category.category, category])),
    gpa: report.gpa,
    assignments: Object.fromEntries(report.details.allocationTraces.map(({ course, assigned }) => [
      course.id,
      assigned.kind === "select" ? assigned.category : assigned.kind,
    ])),
    compulsoryPassed: Object.fromEntries(report.details.compulsoryResults.map((result) => [result.name, result.passed])),
  }));
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
