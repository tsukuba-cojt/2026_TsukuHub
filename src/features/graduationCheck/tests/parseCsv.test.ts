import { describe, expect, test } from "vitest";
import { parseGradesCsv } from "../parseCsv";
import { CSV_HEADER, csvRow } from "./helpers";

describe("parseGradesCsv", () => {
  test("ヘッダーをスキップし、列位置で科目を読み取る", () => {
    const csv = [
      CSV_HEADER,
      csvRow("GC51234", "情報理論", "2.0", "A+", "2023"),
      csvRow("31H1234", "English Reading Skills I", "1.5", "認", "2022"),
    ].join("\n");

    const { courses, errors } = parseGradesCsv(csv);
    expect(errors).toHaveLength(0);
    expect(courses).toEqual([
      { id: "GC51234", name: "情報理論", unit: 2, grade: "A+", year: 2023 },
      {
        id: "31H1234",
        name: "English Reading Skills I",
        unit: 1.5,
        grade: "認",
        year: 2022,
      },
    ]);
  });

  test("ダブルクォート付きCSVも読める", () => {
    const csv = [
      CSV_HEADER,
      `"202300000","筑波 太郎","GC51234","データ構造","2.0","-","-","A","-","2023","-"`,
    ].join("\n");
    const { courses, errors } = parseGradesCsv(csv);
    expect(errors).toHaveLength(0);
    expect(courses[0]).toMatchObject({ id: "GC51234", name: "データ構造" });
  });

  test("不正な行は行番号と理由を返し、正常な行は残す", () => {
    const csv = [
      CSV_HEADER,
      csvRow("GC51234", "情報理論", "2.0", "A", "2023"),
      csvRow("GC50001", "壊れた行", "二単位", "A", "2023"), // 単位数が数値でない
      csvRow("GC50002", "謎の評価", "2.0", "S", "2023"), // 評価が不明
      "短い,行", // 列数不足
    ].join("\n");

    const { courses, errors } = parseGradesCsv(csv);
    expect(courses).toHaveLength(1);
    expect(errors).toHaveLength(3);
    expect(errors[0]).toMatchObject({ rowNumber: 3 });
    expect(errors[0].reason).toContain("単位数");
    expect(errors[1]).toMatchObject({ rowNumber: 4 });
    expect(errors[1].reason).toContain("総合評価");
    expect(errors[2]).toMatchObject({ rowNumber: 5 });
    expect(errors[2].reason).toContain("列数");
  });

  test("空のCSVなら空の結果を返す", () => {
    const { courses, errors } = parseGradesCsv("");
    expect(courses).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });
});
