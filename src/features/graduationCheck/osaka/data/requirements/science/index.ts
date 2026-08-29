/**
 * 理学部 4学科 — 専門必修・選択要件
 *
 * 根拠: 令和8年度理学部学生便覧（教育編）
 * https://www.sci.osaka-u.ac.jp/ja/wp-content/uploads/2020/08/R8_ri_gakuseibinran_kyouiku.pdf
 */

import type { GradRequirementTable } from "../../../../core/types";
import { buildOsakaRequirement, ENROLL_YEARS } from "../buildRequirement";

const scienceFoundationCompulsory = [
  "解析学1",
  "解析学2",
  "線形代数学1",
  "線形代数学2",
  "力学入門",
  "電磁気学入門",
  "化学概論",
  "生物学序説",
  "情報科学基礎",
];

const scienceSpecializedCompulsory = ["卒業研究"];

export const scienceRequirements: GradRequirementTable = {
  "osaka-science-math-22": buildOsakaRequirement({
    department: "理学部",
    major: "数学科",
    enrollYear: ENROLL_YEARS,
    specKey: "science-math",
    extraCompulsory: [
      ...scienceFoundationCompulsory,
      ...scienceSpecializedCompulsory,
    ],
    compulsorySumUnit: 32,
  }),
  "osaka-science-physics-22": buildOsakaRequirement({
    department: "理学部",
    major: "物理学科",
    enrollYear: ENROLL_YEARS,
    specKey: "science-physics",
    extraCompulsory: [
      ...scienceFoundationCompulsory,
      "力学通論",
      "電磁気学通論",
      ...scienceSpecializedCompulsory,
    ],
    compulsorySumUnit: 32,
  }),
  "osaka-science-chemistry-22": buildOsakaRequirement({
    department: "理学部",
    major: "化学科",
    enrollYear: ENROLL_YEARS,
    specKey: "science-chemistry",
    extraCompulsory: [
      ...scienceFoundationCompulsory,
      ...scienceSpecializedCompulsory,
    ],
    compulsorySumUnit: 32,
  }),
  "osaka-science-biology-22": buildOsakaRequirement({
    department: "理学部",
    major: "生物科学科",
    enrollYear: ENROLL_YEARS,
    specKey: "science-biology",
    extraCompulsory: [
      ...scienceFoundationCompulsory,
      ...scienceSpecializedCompulsory,
    ],
    compulsorySumUnit: 32,
  }),
};
