import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "../..");
const outputDirectory = path.join(
  projectRoot,
  "src/features/graduationCheck/curriculum/compiled",
);
const reviewPath = path.join(
  projectRoot,
  "src/features/graduationCheck/curriculum/rule-reviews.json",
);

const canonicalize = (value) => {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])]),
    );
  }
  return value;
};

const stableJson = (value) => JSON.stringify(canonicalize(value));
const sha256 = (value) =>
  createHash("sha256").update(stableJson(value)).digest("hex");

const reviewConfig = JSON.parse(await readFile(reviewPath, "utf8"));
const vite = await createServer({
  root: projectRoot,
  configFile: false,
  appType: "custom",
  logLevel: "silent",
  server: { middlewareMode: true },
});

try {
  const { gradRequirementData } = await vite.ssrLoadModule(
    "/src/features/graduationCheck/data/gradRequirementData.ts",
  );
  const { supportedDepartments } = await vite.ssrLoadModule(
    "/src/features/graduationCheck/data/supportedDepartments.ts",
  );

  const byYear = new Map();
  for (const department of supportedDepartments) {
    for (const major of department.majors) {
      for (const entry of major.requirements) {
        const requirement = gradRequirementData[entry.requirementId];
        if (requirement === undefined) {
          throw new Error(`Missing requirement data: ${entry.requirementId}`);
        }

        for (const admissionYear of entry.admissionYears) {
          const snapshotId = `${department.key}/${major.key}/${admissionYear}`;
          const annualRequirement = structuredClone(requirement);
          annualRequirement.header.enrollYear = admissionYear;
          const review = reviewConfig.reviews[snapshotId] ?? {
            status: reviewConfig.defaultStatus,
            sourceDocumentIds: [],
            blockingIssues: [reviewConfig.defaultBlockingIssue],
          };
          const snapshots = byYear.get(admissionYear) ?? [];
          snapshots.push({
            snapshotId,
            admissionYear,
            department: { key: department.key, label: department.label },
            major: { key: major.key, label: major.label },
            requirementId: entry.requirementId,
            ruleSemanticSha256: sha256({
              department: requirement.header.department,
              major: requirement.header.major,
              courses: requirement.courses,
            }),
            snapshotSha256: sha256(annualRequirement),
            review,
            publishable: review.status === "approved",
            requirement: annualRequirement,
          });
          byYear.set(admissionYear, snapshots);
        }
      }
    }
  }

  await mkdir(outputDirectory, { recursive: true });
  const years = [];
  for (const [admissionYear, snapshots] of [...byYear.entries()].sort(
    ([left], [right]) => left - right,
  )) {
    snapshots.sort((left, right) =>
      left.snapshotId.localeCompare(right.snapshotId),
    );
    const yearDirectory = path.join(outputDirectory, String(admissionYear));
    const entries = [];
    for (const snapshot of snapshots) {
      const departmentDirectory = path.join(
        yearDirectory,
        snapshot.department.key,
      );
      await mkdir(departmentDirectory, { recursive: true });
      const relativeFileName = `${snapshot.department.key}/${snapshot.major.key}.json`;
      const document = {
        schemaVersion: "grad-requirement-snapshot-2.0.0",
        admissionYear,
        department: snapshot.department,
        major: snapshot.major,
        generatedFrom: [
          "data/gradRequirementData.ts",
          "data/supportedDepartments.ts",
          "curriculum/rule-reviews.json",
        ],
        snapshot,
      };
      const contents = `${JSON.stringify(document, null, 2)}\n`;
      await writeFile(
        path.join(yearDirectory, relativeFileName),
        contents,
        "utf8",
      );
      entries.push({
        snapshotId: snapshot.snapshotId,
        fileName: relativeFileName,
        requirementId: snapshot.requirementId,
        publishable: snapshot.publishable,
        sha256: createHash("sha256").update(contents).digest("hex"),
      });
    }

    const indexDocument = {
      schemaVersion: "annual-grad-requirement-index-2.0.0",
      admissionYear,
      entries,
    };
    const indexContents = `${JSON.stringify(indexDocument, null, 2)}\n`;
    const indexFile = `${admissionYear}/index.json`;
    await writeFile(
      path.join(yearDirectory, "index.json"),
      indexContents,
      "utf8",
    );
    years.push({
      admissionYear,
      indexFile,
      snapshotCount: entries.length,
      sha256: createHash("sha256").update(indexContents).digest("hex"),
    });

    // v1 の単一巨大ファイルは、v2 の階層出力へ移行した後は残さない。
    await rm(path.join(outputDirectory, `requirements-${admissionYear}.json`), {
      force: true,
    });
  }

  const manifest = {
    schemaVersion: "grad-requirement-manifest-2.0.0",
    hierarchy: ["admissionYear", "department", "major"],
    years,
  };
  await writeFile(
    path.join(outputDirectory, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
  process.stdout.write(
    `Wrote ${years.length} annual indexes and ${[...byYear.values()].flat().length} major snapshots to ${path.relative(projectRoot, outputDirectory)}\n`,
  );
} finally {
  await vite.close();
}
