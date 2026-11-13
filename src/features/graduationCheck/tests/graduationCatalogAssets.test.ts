import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const expectedAssets = [
  {
    year: 2023,
    groups: 2_292,
    sha256: "8aca44f7c164d35bbb4449a5198610260c96713a759de0d1f295d36127cbbeff",
  },
  {
    year: 2024,
    groups: 1_870,
    sha256: "3a74de3ea118a85c420cf67728a42f7155c834f6afff8682b8d15142139fbe15",
  },
  {
    year: 2025,
    groups: 1_290,
    sha256: "ed59d7f92b9faf6e60d9adbb7d50747027e4cdc9469b3a3e6154254205fdf13b",
  },
  {
    year: 2026,
    groups: 1_250,
    sha256: "b46050ba62c0ffa989402ef688321144118ea461262a68534b529f8c04988ca5",
  },
] as const;

describe("graduation catalog assets", () => {
  test.each(expectedAssets)(
    "$year年度の同一授業グループを年度別授業JSONから保持する",
    async ({ year, groups, sha256 }) => {
      const payload = JSON.parse(
        await readFile(
          resolve(
            `public/data/graduation/tsukuba-${year}-cross-listings.json`,
          ),
          "utf8",
        ),
      ) as {
        schema_version: string;
        university: string;
        academic_year: number;
        source_sha256: string;
        repository_commit: string;
        groups: string[][];
      };

      expect(payload).toEqual(
        expect.objectContaining({
          schema_version: "graduation-cross-listings-1.0.0",
          university: "tsukuba",
          academic_year: year,
          source_sha256: sha256,
          repository_commit: "b3d77356c21bad19dd3578f316b9fcec7f7f47a7",
        }),
      );
      expect(payload.groups).toHaveLength(groups);
      expect(payload.groups.every((group) => group.length > 1)).toBe(true);
      expect(
        payload.groups.every(
          (group) => new Set(group).size === group.length,
        ),
      ).toBe(true);
    },
  );
});
