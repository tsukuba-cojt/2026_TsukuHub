import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { gradRequirementData } from "../data/gradRequirementData";
import { supportedDepartments } from "../data/supportedDepartments";

type AnnualSnapshot = {
  snapshotId: string;
  admissionYear: number;
  requirementId: keyof typeof gradRequirementData;
  ruleSemanticSha256: string;
  snapshotSha256: string;
  review: { status: "approved" | "needs_review" | "unsupported" };
  publishable: boolean;
  requirement: (typeof gradRequirementData)[keyof typeof gradRequirementData];
};

type MajorSnapshotDocument = {
  schemaVersion: string;
  admissionYear: number;
  snapshot: AnnualSnapshot;
};

type AnnualSnapshotIndex = {
  schemaVersion: string;
  admissionYear: number;
  entries: { snapshotId: string; fileName: string }[];
};

type SnapshotManifest = {
  schemaVersion: string;
  hierarchy: string[];
  years: { admissionYear: number; indexFile: string; snapshotCount: number }[];
};

const compiledDirectory = path.resolve(
  "src/features/graduationCheck/curriculum/compiled",
);

const listJsonFiles = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? listJsonFiles(file) : entry.name.endsWith(".json") ? [file] : [];
  }))).flat();
};

const canonicalize = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [
          key,
          canonicalize((value as Record<string, unknown>)[key]),
        ]),
    );
  }
  return value;
};

const semanticSha256 = (value: unknown) =>
  createHash("sha256")
    .update(JSON.stringify(canonicalize(value)))
    .digest("hex");

const readAnnualSnapshot = async (
  admissionYear: number,
): Promise<AnnualSnapshot[]> => {
  const yearDirectory = path.join(compiledDirectory, String(admissionYear));
  const index = JSON.parse(
    await readFile(path.join(yearDirectory, "index.json"), "utf8"),
  ) as AnnualSnapshotIndex;
  expect(index.schemaVersion).toBe("annual-grad-requirement-index-2.0.0");
  const documents = await Promise.all(
    index.entries.map(async (entry) =>
      JSON.parse(
        await readFile(path.join(yearDirectory, entry.fileName), "utf8"),
      ) as MajorSnapshotDocument,
    ),
  );
  expect(
    documents.map((document) => document.snapshot.snapshotId),
  ).toEqual(index.entries.map((entry) => entry.snapshotId));
  expect(
    documents.every(
      (document) =>
        document.schemaVersion === "grad-requirement-snapshot-2.0.0" &&
        document.admissionYear === admissionYear,
    ),
  ).toBe(true);
  return documents.map((document) => document.snapshot);
};

describe("年度別の完全卒業要件スナップショット", () => {
  test("年度・学類・主専攻の階層と年度索引を公開する", async () => {
    const manifest = JSON.parse(
      await readFile(path.join(compiledDirectory, "manifest.json"), "utf8"),
    ) as SnapshotManifest;

    expect(manifest.schemaVersion).toBe("grad-requirement-manifest-2.0.0");
    const expectedFiles = [path.join(compiledDirectory, "manifest.json")];
    for (const year of manifest.years) {
      const indexFile = path.join(compiledDirectory, year.indexFile);
      expectedFiles.push(indexFile);
      const index = JSON.parse(await readFile(indexFile, "utf8")) as AnnualSnapshotIndex;
      expectedFiles.push(...index.entries.map((entry) => path.join(path.dirname(indexFile), entry.fileName)));
    }
    expect((await listJsonFiles(compiledDirectory)).sort()).toEqual(expectedFiles.sort());
    expect(manifest.hierarchy).toEqual([
      "admissionYear",
      "department",
      "major",
    ]);
    expect(manifest.years.map((year) => year.indexFile)).toEqual(
      manifest.years.map(
        (year) => `${year.admissionYear.toString()}/index.json`,
      ),
    );
    expect(
      manifest.years.reduce((sum, year) => sum + year.snapshotCount, 0),
    ).toBe(
      supportedDepartments.reduce(
        (departmentSum, department) =>
          departmentSum +
          department.majors.reduce(
            (majorSum, major) =>
              majorSum +
              major.requirements.reduce(
                (yearSum, requirement) =>
                  yearSum + requirement.admissionYears.length,
                0,
              ),
            0,
          ),
        0,
      ),
    );
  });

  test("対応表の全年度・全主専攻を完全な要件データとして展開する", async () => {
    const expected = supportedDepartments.flatMap((department) =>
      department.majors.flatMap((major) =>
        major.requirements.flatMap((entry) =>
          entry.admissionYears.map((admissionYear) => ({
            snapshotId: `${department.key}/${major.key}/${admissionYear}`,
            admissionYear,
            requirementId: entry.requirementId,
          })),
        ),
      ),
    );
    const years = [...new Set(expected.map((item) => item.admissionYear))];
    const actual = (
      await Promise.all(years.map(readAnnualSnapshot))
    ).flat();

    expect(
      actual
        .map(({ snapshotId, admissionYear, requirementId }) => ({
          snapshotId,
          admissionYear,
          requirementId,
        }))
        .sort(
          (left, right) =>
            left.admissionYear - right.admissionYear ||
            left.snapshotId.localeCompare(right.snapshotId),
        ),
    ).toEqual(
      expected.sort(
        (left, right) =>
          left.admissionYear - right.admissionYear ||
          left.snapshotId.localeCompare(right.snapshotId),
      ),
    );

    for (const snapshot of actual) {
      const sourceRequirement = gradRequirementData[snapshot.requirementId];
      expect(snapshot.requirement).toEqual({
        ...sourceRequirement,
        header: {
          ...sourceRequirement.header,
          enrollYear: snapshot.admissionYear,
        },
      });
      expect(snapshot.ruleSemanticSha256).toBe(
        semanticSha256({
          department: sourceRequirement.header.department,
          major: sourceRequirement.header.major,
          courses: sourceRequirement.courses,
        }),
      );
      expect(snapshot.snapshotSha256).toBe(
        semanticSha256(snapshot.requirement),
      );
      expect(snapshot.publishable).toBe(snapshot.review.status === "approved");
    }
  });

  test("同じルール版は年度が違っても同じ意味ハッシュになる", async () => {
    const snapshots = (
      await Promise.all([2023, 2024].map(readAnnualSnapshot))
    ).flat();
    const media = snapshots.filter(
      (snapshot) => snapshot.requirementId === "mast-23",
    );

    expect(
      new Set(media.map((snapshot) => snapshot.ruleSemanticSha256)).size,
    ).toBe(1);
    expect(new Set(media.map((snapshot) => snapshot.snapshotSha256)).size).toBe(
      2,
    );
  });

  test("異なるルール版は完全スナップショットの意味ハッシュも異なる", async () => {
    const before = (await readAnnualSnapshot(2024)).find(
      (snapshot) => snapshot.snapshotId === "physics/physics/2024",
    );
    const after = (await readAnnualSnapshot(2025)).find(
      (snapshot) => snapshot.snapshotId === "physics/physics/2025",
    );

    expect(before?.requirementId).toBe("physics-24");
    expect(after?.requirementId).toBe("physics-25");
    expect(before?.ruleSemanticSha256).not.toBe(after?.ruleSemanticSha256);
  });

  test("比較文化学類は未解決のまま公開可能にしない", async () => {
    const snapshots = (
      await Promise.all([2023, 2024, 2025, 2026].map(readAnnualSnapshot))
    )
      .flat()
      .filter((snapshot) =>
        snapshot.snapshotId.startsWith(
          "comparative-culture/comparative-culture/",
        ),
      );

    expect(snapshots.map((snapshot) => snapshot.review.status)).toEqual([
      "unsupported",
      "unsupported",
      "unsupported",
      "unsupported",
    ]);
    expect(snapshots.every((snapshot) => !snapshot.publishable)).toBe(true);
  });
});
