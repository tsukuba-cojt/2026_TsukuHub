/**
 * 卒業要件チェックのオーケストレータ
 *
 * 成績（パース済み科目リスト）と要件データの選択キーを受け取り、
 * UIが表示するだけで済む判定結果オブジェクトを返す純粋関数。
 * 判定ロジックは Mimori256/Graduation-Checker
 * (https://github.com/Mimori256/Graduation-Checker, MPL-2.0) を踏襲している。
 *
 * 判定の流れ:
 * 1. 必修判定（マッチした科目を候補から消し込む）
 * 2. 残りの科目で選択判定（要件ごとに消し込む）
 * 3. グループごとに単位集計 → 上限キャップ → 5区分へマッピング
 * 4. 全体サマリー・GPA・A率を計算
 *
 * 単位は「確定（履修中を除く）」と「見込み（履修中を含む）」の2系統で数える。
 */

import { categoryLabels, groupLabelToCategory } from "./categoryMapping";
import { checkCompulsory, countCompulsoryUnits } from "./checkCompulsory";
import { checkSelect } from "./checkSelect";
import { gradRequirementData } from "./data/gradRequirementData";
import { calcARatePercent, calcGpa, GPA_MAX } from "./gpa";
import type {
  CategoryResult,
  Course,
  GraduationCheckReport,
  RequirementId,
  UnitProgress,
} from "./types";
import { sumUnits } from "./utils";

const toPercent = (earned: number, required: number): number =>
  required > 0 ? (earned / required) * 100 : 0;

const makeProgress = (
  requiredUnits: number,
  earnedUnits: number,
  prospectiveUnits: number
): UnitProgress => {
  const percent = toPercent(earnedUnits, requiredUnits);
  const prospectivePercent = toPercent(prospectiveUnits, requiredUnits);
  return {
    requiredUnits,
    earnedUnits,
    prospectiveUnits,
    percent,
    percentClamped: Math.min(percent, 100),
    prospectivePercent,
    prospectivePercentClamped: Math.min(prospectivePercent, 100),
  };
};

/** 対応している要件データの一覧（UIの選択肢生成用） */
export const listSupportedRequirements = () =>
  (Object.keys(gradRequirementData) as RequirementId[]).map((id) => ({
    id,
    ...gradRequirementData[id].header,
  }));

/**
 * 学類名・入学年度から要件データの候補キーを返す。
 * 知識情報・図書館学類のように主専攻で要件が分かれる場合は複数返す
 * （UI側で主専攻を選択させる）。対応外なら空配列。
 * 学類名は「・」の有無の表記ゆれを吸収して比較する。
 */
export const resolveRequirementIds = (
  department: string,
  admissionYear: number | string
): RequirementId[] => {
  const normalize = (name: string) => name.replaceAll("・", "");
  const year = Number(admissionYear);
  const suffix =
    year === 2021
      ? "21"
      : year >= 2022 && year <= 2024
        ? "22"
        : year === 2025
          ? "25"
          : null;
  if (suffix === null) return [];
  return (Object.keys(gradRequirementData) as RequirementId[]).filter(
    (id) =>
      normalize(gradRequirementData[id].header.department) ===
        normalize(department) && id.endsWith(`-${suffix}`)
  );
};

/**
 * 卒業要件を判定して結果オブジェクトを返す。
 * すべてクライアント内で完結する（副作用なし・入力を変更しない）。
 */
export const checkGraduation = (
  courses: Course[],
  requirementId: RequirementId
): GraduationCheckReport => {
  const requirement = gradRequirementData[requirementId];
  const { compulsorySumUnit, selectMinimumUnit, groups } = requirement.courses;

  // 1. 必修 → 2. 選択（マッチした科目は順に消し込み）
  const { compulsoryResults, remainingCourses } = checkCompulsory(
    courses,
    requirement
  );
  const { selectResults, leftCourses } = checkSelect(
    remainingCourses,
    requirement
  );

  // 3. グループ集計（確定 / 見込みの2系統。グループ上限でキャップ）
  const groupUnits = groups.map(([groupNo, minimum, maximum, label]) => {
    const groupCourses = selectResults
      .filter((result) => result.group === groupNo)
      .flatMap((result) => result.courses);
    return {
      groupNo,
      minimum,
      maximum,
      label,
      earned: Math.min(sumUnits(groupCourses, false), maximum),
      prospective: Math.min(sumUnits(groupCourses, true), maximum),
    };
  });

  // 必修の取得単位（区分・サマリーとも必要単位でキャップ）
  const compulsoryEarned = Math.min(
    countCompulsoryUnits(compulsoryResults, false),
    compulsorySumUnit
  );
  const compulsoryProspective = Math.min(
    countCompulsoryUnits(compulsoryResults, true),
    compulsorySumUnit
  );

  // 5区分（必修＋マッピング済みグループ）。対応しないグループは集計に含めない
  const categories: CategoryResult[] = [
    {
      category: "compulsory",
      label: categoryLabels.compulsory,
      ...makeProgress(compulsorySumUnit, compulsoryEarned, compulsoryProspective),
    },
  ];
  const unmappedGroupUnits: Record<string, number> = {};
  for (const group of groupUnits) {
    const category = groupLabelToCategory[group.label];
    if (category === undefined) {
      unmappedGroupUnits[group.label] = group.prospective;
      continue;
    }
    categories.push({
      category,
      label: categoryLabels[category],
      maxUnits: group.maximum,
      ...makeProgress(group.minimum, group.earned, group.prospective),
    });
  }

  // 4. 全体サマリー（選択合計は selectMinimumUnit でさらにキャップ）
  const requiredTotal = compulsorySumUnit + selectMinimumUnit;
  const selectEarned = Math.min(
    groupUnits.reduce((total, group) => total + group.earned, 0),
    selectMinimumUnit
  );
  const selectProspective = Math.min(
    groupUnits.reduce((total, group) => total + group.prospective, 0),
    selectMinimumUnit
  );
  const summaryProgress = makeProgress(
    requiredTotal,
    compulsoryEarned + selectEarned,
    compulsoryProspective + selectProspective
  );

  const gpa = calcGpa(courses);

  return {
    requirement: { id: requirementId, ...requirement.header },
    summary: {
      ...summaryProgress,
      shortageUnits: Math.max(requiredTotal - summaryProgress.earnedUnits, 0),
      prospectiveShortageUnits: Math.max(
        requiredTotal - summaryProgress.prospectiveUnits,
        0
      ),
    },
    gpa: {
      value: gpa.value,
      max: GPA_MAX,
      targetUnits: gpa.targetUnits,
      aRatePercent: calcARatePercent(courses),
    },
    categories,
    details: {
      compulsoryResults,
      selectResults,
      uncountedCourses: leftCourses,
      unmappedGroupUnits,
    },
  };
};
